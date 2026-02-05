import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, "Todo title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    default: "",
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  // ✅ Track completion timestamp
  completedAt: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
todoSchema.index({ boardId: 1, order: 1 });
todoSchema.index({ boardId: 1, status: 1 });
todoSchema.index({ boardId: 1, completedAt: 1 });

// ✅ FIXED: Use default export
const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
