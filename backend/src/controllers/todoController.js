import { Todo } from "../models/Todo.js";
import { Board } from "../models/Board.js";

// ✅ Get todos for a board - WITH owner verification
export const getTodosByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    console.log(`📝 Fetching todos for board: ${boardId}, user: ${userId.substring(0, 8)}...`);

    // ✅ Step 1: Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    
    if (!board) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Board not found or access denied"
      });
    }

    // ✅ Step 2: Get todos (double security with ownerId)
    const todos = await Todo.find({ 
      boardId, 
      ownerId: userId  // ✅ Extra security layer
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log(`✅ Found ${todos.length} todos for board: ${board.title}`);

    res.json({
      success: true,
      count: todos.length,
      boardTitle: board.title,
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

// ✅ Create todo - WITH owner verification
export const createTodo = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user.id;

    console.log(`📝 Creating todo for board: ${boardId}, user: ${userId.substring(0, 8)}...`);

    // ✅ Step 1: Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    
    if (!board) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Board not found or access denied"
      });
    }

    // ✅ Step 2: Validate title
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Todo title is required"
      });
    }

    // ✅ Step 3: Create todo with ownerId
    const todo = await Todo.create({
      boardId,
      ownerId: userId,  // ✅ CRITICAL - User isolation
      title: title.trim(),
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null
    });

    console.log(`✅ Todo created: "${todo.title}" in board "${board.title}"`);

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error("❌ Create todo error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating todo",
      error: error.message
    });
  }
};

// ✅ Update todo - WITH owner verification
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.user.id;

    console.log(`📝 Updating todo: ${id}, user: ${userId.substring(0, 8)}...`);

    // ✅ Step 1: Find todo and verify ownership
    const todo = await Todo.findOne({ _id: id, ownerId: userId });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found or unauthorized"
      });
    }

    // ✅ Step 2: Verify board ownership (extra security)
    const board = await Board.findOne({ _id: todo.boardId, ownerId: userId });
    
    if (!board) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Board access denied"
      });
    }

    // ✅ Step 3: Update fields
    if (title) todo.title = title.trim();
    if (description !== undefined) todo.description = description;
    if (status) todo.status = status;
    if (priority) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    
    // ✅ Auto-set completedAt when status changes to done
    if (status === 'done' && todo.status !== 'done') {
      todo.completedAt = new Date();
    } else if (status && status !== 'done') {
      todo.completedAt = null;
    }
    
    await todo.save();

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

// ✅ Delete todo - WITH owner verification
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`📝 Deleting todo: ${id}, user: ${userId.substring(0, 8)}...`);

    // ✅ Find and delete in one operation (with ownership check)
    const todo = await Todo.findOneAndDelete({ 
      _id: id, 
      ownerId: userId  // ✅ Security check
    });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found or unauthorized"
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

// ✅ Toggle todo status (bonus feature)
export const toggleTodoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`📝 Toggling todo status: ${id}`);

    // ✅ Find todo with ownership check
    const todo = await Todo.findOne({ _id: id, ownerId: userId });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found or unauthorized"
      });
    }

    // ✅ Toggle status
    if (todo.status === 'done') {
      todo.status = 'todo';
      todo.completedAt = null;
    } else {
      todo.status = 'done';
      todo.completedAt = new Date();
    }

    await todo.save();

    console.log(`✅ Todo status toggled: "${todo.title}" → ${todo.status}`);

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error("❌ Toggle todo error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling todo status",
      error: error.message
    });
  }
};
