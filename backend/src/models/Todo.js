import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, "Todo title is required"],
    trim: true,
    maxlength: [500, "Title cannot exceed 500 characters"]
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
    enum: ['todo', 'active', 'done'],
    default: 'todo'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  dueDate: {
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
todoSchema.index({ userId: 1, completedAt: 1 });
todoSchema.index({ boardId: 1, completed: 1 });

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
