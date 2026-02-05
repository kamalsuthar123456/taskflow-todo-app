import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Board title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    default: "",
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  ownerId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
boardSchema.index({ ownerId: 1, createdAt: -1 });

// ✅ FIXED: Use default export
const Board = mongoose.model("Board", boardSchema);
export default Board;
