import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
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
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    dueDate: { 
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

export const Todo = mongoose.model("Todo", todoSchema);
