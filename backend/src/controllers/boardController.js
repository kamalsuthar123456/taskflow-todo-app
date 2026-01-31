import { Board } from "../models/Board.js";

// Get all boards for logged-in user
export const getBoards = async (req, res) => {
  try {
    // Get userId from header or use "test-user" for now
    const userId = req.headers['x-user-id'] || 'test-user';
    
    const boards = await Board.find({ ownerId: userId })
      .sort("-createdAt");
    
    res.json({
      success: true,
      count: boards.length,
      data: boards
    });
  } catch (error) {
    // console.error("Error fetching boards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching boards",
      error: error.message
    });
  }
};

// Create new board
export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Get userId from header or use "test-user"
    const userId = req.headers['x-user-id'] || 'test-user';
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Board title is required"
      });
    }

    const board = await Board.create({
      title: title.trim(),
      description: description || "",
      ownerId: userId
    });

    // console.log("✅ Board created:", board.title);

    res.status(201).json({
      success: true,
      data: board
    });
  } catch (error) {
    // console.error("❌ Error creating board:", error);
    res.status(500).json({
      success: false,
      message: "Error creating board",
      error: error.message
    });
  }
};

// Update board
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.headers['x-user-id'] || 'test-user';

    const board = await Board.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { 
        title: title?.trim(), 
        description: description || "" 
      },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found or unauthorized"
      });
    }

    // console.log("✅ Board updated:", board.title);

    res.json({
      success: true,
      data: board
    });
  } catch (error) {
    // console.error("❌ Error updating board:", error);
    res.status(500).json({
      success: false,
      message: "Error updating board",
      error: error.message
    });
  }
};

// Delete board
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] || 'test-user';

    const board = await Board.findOneAndDelete({
      _id: id,
      ownerId: userId
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found or unauthorized"
      });
    }

    // console.log("✅ Board deleted:", board.title);

    res.status(204).send();
  } catch (error) {
    // console.error("❌ Error deleting board:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting board",
      error: error.message
    });
  }
};
