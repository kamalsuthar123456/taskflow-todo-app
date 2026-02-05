import { User } from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, emailVerified } = req.body;

    console.log(`🔄 User sync request: ${email}`);

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID aur email required hai"
      });
    }

    // User dhundo
    let user = await User.findOne({ 
      $or: [{ firebaseUid }, { email }] 
    });

    if (user) {
      // Update karo
      user.firebaseUid = firebaseUid;
      user.email = email;
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      user.emailVerified = emailVerified;
      user.lastLoginAt = new Date();
      await user.save();

      console.log(`✅ User UPDATED: ${email}`);

      return res.json({
        success: true,
        message: "User updated successfully",
        data: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email
        }
      });
    }

    // Naya user banao
    user = await User.create({
      firebaseUid,
      email,
      displayName: displayName || "",
      photoURL: photoURL || "",
      emailVerified: emailVerified || false,
      lastLoginAt: new Date()
    });

    console.log(`✅ User CREATED: ${email}`);

    res.status(201).json({
      success: true,
      message: "User created",
      data: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email
      }
    });

  } catch (error) {
    console.error("❌ User sync error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error syncing user",
      error: error.message
    });
  }
};