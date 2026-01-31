import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

// Create or update user in MongoDB after Firebase registration
router.post("/sync", async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, emailVerified } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and email are required"
      });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.email = email;
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      user.emailVerified = emailVerified || user.emailVerified;
      user.lastLoginAt = new Date();
      await user.save();

      // console.log("✅ User updated in MongoDB:", user.email);

      return res.json({
        success: true,
        message: "User updated successfully",
        data: user
      });
    }

    // Create new user
    user = await User.create({
      firebaseUid,
      email,
      displayName: displayName || "",
      photoURL: photoURL || "",
      emailVerified: emailVerified || false
    });

    // console.log("✅ New user created in MongoDB:", user.email);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });

  } catch (error) {
    // console.error("❌ Error syncing user:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing user",
      error: error.message
    });
  }
});

// Get user by Firebase UID
router.get("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    // console.error("❌ Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
});

export default router;
