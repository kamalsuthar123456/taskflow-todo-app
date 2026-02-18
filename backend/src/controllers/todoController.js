import Todo from "../models/Todo.js";
import Board from "../models/Board.js";

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

// ✅ FIXED: Create todo (ADD userId)
export const createTodo = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, priority, status } = req.body;
    const userId = req.user.id; // ✅ Get userId from auth middleware

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

    // ✅ FIX: Add userId when creating todo
    const todo = await Todo.create({
      boardId,
      userId,
      title: title.trim(),
      description: description || "",
      priority: priority || "medium",
      status: status || "todo",
      completed: false,
      completedAt: null
    });

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
