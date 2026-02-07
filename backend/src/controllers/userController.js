import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, emailVerified } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and email are required"
      });
    }

    const userData = {
      firebaseUid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || "",
      emailVerified: emailVerified || false,
      lastLogin: new Date()
    };

    // Use findOneAndUpdate with upsert to create or update
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      userData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // // ✅ Log Google sign-in users
    // if (photoURL && photoURL.includes('googleusercontent')) {
    //   console.log('✅ Google user synced:', email);
    // } else {
    //   console.log('✅ Email/Password user synced:', email);
    // }

    res.status(200).json({
      success: true,
      message: "User synced successfully",
      data: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error("❌ Sync user error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists with different credentials"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error syncing user",
      error: error.message
    });
  }
};
