import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
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
      index: true // For faster queries
    }
  },
  { 
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

export const Board = mongoose.model("Board", boardSchema);
