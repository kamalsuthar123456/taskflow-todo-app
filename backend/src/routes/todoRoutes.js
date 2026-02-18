import express from "express";
import {
  getTodosByBoard,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import Board from "../models/Board.js";
import Todo from "../models/Todo.js";

const router = express.Router({ mergeParams: true });

// ============================================
// 🔒 AUTHENTICATION MIDDLEWARE
// ============================================
router.use(requireAuth);

// ============================================
// 📋 TODO CRUD ROUTES
// ============================================

// Get all todos for a board
router.get("/", getTodosByBoard);

// Create new todo
router.post("/", createTodo);

// Update todo
router.put("/:id", updateTodo);

// Toggle todo status (ensure userId exists before saving)
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id: todoId } = req.params;
    const { boardId } = req.params;
    const userId = req.user?.id || req.userId;

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, ownerId: userId });
    if (!board) {
      return res.status(404).json({ 
        success: false,
        error: 'Board not found or access denied' 
      });
    }

    // Find todo
    const todo = await Todo.findOne({ _id: todoId, boardId });
    if (!todo) {
      return res.status(404).json({ 
        success: false,
        error: 'Todo not found' 
      });
    }

    // Ensure userId exists before saving
    if (!todo.userId) {
      todo.userId = userId;
    }

    // Toggle status and track completion time
    if (todo.status === 'done') {
      todo.status = 'todo';
      todo.completed = false;
      todo.completedAt = null;
    } else {
      todo.status = 'done';
      todo.completed = true;
      todo.completedAt = new Date();
    }

    await todo.save();
    
    res.json({ 
      success: true,
      data: todo 
    });
  } catch (error) {
    console.error('❌ Toggle todo error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: error.message 
    });
  }
});

// Delete todo
router.delete("/:id", deleteTodo);

// ============================================
// 🔥 STREAK TRACKING ROUTE
// ============================================

// Get user's completion streak
router.get("/streak", async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    // Get all user's boards
    const boards = await Board.find({ ownerId: userId });
    const boardIds = boards.map(b => b._id);

    if (boardIds.length === 0) {
      return res.json({
        success: true,
        data: {
          streak: 0,
          completionsByDay: {},
          uniqueDates: [],
          totalCompleted: 0
        }
      });
    }

    // Get all completed todos with completion dates
    const completedTodos = await Todo.find({
      boardId: { $in: boardIds },
      status: 'done',
      completedAt: { $ne: null, $exists: true }
    }).select('completedAt title');

    // Extract unique completion dates (YYYY-MM-DD format)
    const completionDates = completedTodos
      .filter(todo => todo.completedAt)
      .map(todo => {
        const date = new Date(todo.completedAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });

    // Get unique dates and sort descending
    const uniqueDates = [...new Set(completionDates)].sort().reverse();

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check consecutive days starting from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      if (uniqueDates.includes(dateKey)) {
        streak++;
      } else {
        break;
      }
    }

    // Build completions map for frontend
    const completionsByDay = {};
    uniqueDates.forEach(date => {
      completionsByDay[date] = true;
    });

    // Send response
    res.json({
      success: true,
      data: {
        streak,
        completionsByDay,
        uniqueDates,
        totalCompleted: completedTodos.length
      }
    });

  } catch (error) {
    console.error('❌ Streak calculation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to calculate streak',
      message: error.message 
    });
  }
});

export default router;
