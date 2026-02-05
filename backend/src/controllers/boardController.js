import { Board } from "../models/Board.js";
import { Todo } from "../models/Todo.js";

// ✅ Get boards - ONLY user's own boards
export const getBoards = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📋 Fetching boards for user: ${userId.substring(0, 8)}...`);
    
    // ✅ Filter by ownerId
    const boards = await Board.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${boards.length} boards`);
    
    res.json({
      success: true,
      count: boards.length,
      data: boards
    });
  } catch (error) {
    console.error("❌ Get boards error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching boards",
      error: error.message
    });
  }
};

// ✅ Create board with ownerId
export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    
    console.log(`📋 Creating board for: ${userId.substring(0, 8)}...`);
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Board title is required"
      });
    }

    const board = await Board.create({
      title: title.trim(),
      description: description || "",
      ownerId: userId  // ✅ CRITICAL
    });

    console.log(`✅ Board created: "${board.title}"`);

    res.status(201).json({
      success: true,
      data: board
    });
  } catch (error) {
    console.error("❌ Create board error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating board",
      error: error.message
    });
  }
};

// ✅ Update board - ONLY if user owns it
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    // ✅ Security: Check ownerId
    const board = await Board.findOneAndUpdate(
      { _id: id, ownerId: userId },  // ✅ Double lock
      { 
        title: title?.trim(), 
        description: description || "" 
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found or unauthorized"
      });
    }

    console.log(`✅ Board updated: "${board.title}"`);

    res.json({
      success: true,
      data: board
    });
  } catch (error) {
    console.error("❌ Update board error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating board",
      error: error.message
    });
  }
};

// ✅ Delete board - ONLY if user owns it
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // ✅ Security: Check ownerId
    const board = await Board.findOneAndDelete({
      _id: id,
      ownerId: userId  // ✅ Critical check
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found or unauthorized"
      });
    }

    // ✅ Delete all todos of this board
    const deletedTodos = await Todo.deleteMany({ 
      boardId: id,
      ownerId: userId  // ✅ Extra security
    });

    console.log(`✅ Board deleted: "${board.title}" (${deletedTodos.deletedCount} todos removed)`);

    res.status(204).send();
  } catch (error) {
    console.error("❌ Delete board error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting board",
      error: error.message
    });
  }
};
