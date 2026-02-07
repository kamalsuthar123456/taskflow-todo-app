import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from "firebase/auth";
import { auth } from "../firebase";

// Create Google provider instance
export const googleProvider = new GoogleAuthProvider();

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Detect if user is on mobile
 */
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Smart Google Sign-In (Auto-detects popup vs redirect)
 */
export const signInWithGooglePopup = async () => {
  try {
    
    // ✅ Use redirect on mobile, popup on desktop
    if (isMobile()) {
      await signInWithRedirect(auth, googleProvider);
      // Redirect will happen, no return needed
      return { success: true, redirecting: true };
    }
    
    // Desktop: Use popup
    const result = await signInWithPopup(auth, googleProvider);
    
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
        
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      },
      token,
    };
    
  } catch (error) {
    console.error('❌ Google Sign-In failed:', error);
    
    const errorCode = error.code;
    const errorMessage = error.message;
    
    // Handle specific errors
    if (errorCode === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      throw new Error(
        `An account already exists with the email ${email}. Please sign in using your original method.`
      );
    }
    
    if (errorCode === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    }
    
    if (errorCode === 'auth/popup-blocked') {
      throw new Error('Popup blocked. Please allow popups for this site or try again.');
    }
    
    if (errorCode === 'auth/cancelled-popup-request') {
      throw new Error('Only one popup request is allowed at a time.');
    }
    
    // Network errors
    if (errorCode === 'auth/network-request-failed') {
      throw new Error('Network error. Check your internet connection.');
    }
    
    throw new Error(errorMessage || 'Google Sign-In failed. Please try again.');
  }
};

/**
 * Handle redirect result after user returns from Google
 * Call this in your AuthContext on app load
 */
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
            
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        },
        token,
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Google Redirect Result failed:', error);
    
    const errorCode = error.code;
    const errorMessage = error.message;
    
    if (errorCode === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      throw new Error(
        `An account already exists with ${email}. Please use your original sign-in method.`
      );
    }
    
    throw new Error(errorMessage || 'Failed to complete Google Sign-In.');
  }
};
