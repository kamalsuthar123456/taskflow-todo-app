import Todo from "../models/Todo.js"; // ✅ Default import
import Board from "../models/Board.js"; // ✅ Default import

// Get todos by board
export const getTodosByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const todos = await Todo.find({ boardId })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    console.log(`✅ Found ${todos.length} todos for board: ${boardId}`);

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error("❌ Get todos error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching todos",
      error: error.message
    });
  }
};

// Create todo
export const createTodo = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, priority, status } = req.body;
    const userId = req.user.id;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Todo title is required"
      });
    }

    const todo = await Todo.create({
      boardId,
      title: title.trim(),
      description: description || "",
      priority: priority || "medium",
      status: status || "todo"
    });

    console.log(`✅ Todo created: "${todo.title}"`);

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error("❌ Create todo error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating todo",
      error: error.message
    });
  }
};

// Update todo
export const updateTodo = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    const { title, description, priority, status } = req.body;
    const userId = req.user.id;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, boardId },
      { 
        title: title?.trim(),
        description,
        priority,
        status 
      },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    console.log(`✅ Todo updated: "${todo.title}"`);

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error("❌ Update todo error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating todo",
      error: error.message
    });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    const userId = req.user.id;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found"
      });
    }

    const todo = await Todo.findOneAndDelete({ _id: id, boardId });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    console.log(`✅ Todo deleted: "${todo.title}"`);

    res.status(204).send();
  } catch (error) {
    console.error("❌ Delete todo error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting todo",
      error: error.message
    });
  }
};
