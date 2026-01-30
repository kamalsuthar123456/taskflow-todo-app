import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      default: ""
    },
    photoURL: {
      type: String,
      default: ""
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
