import { 
  GoogleAuthProvider, 
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
 * Initiate Google Sign-In (Redirect)
 */
export const signInWithGooglePopup = async () => {
  try {
    console.log('🚀 Starting Google Sign-in redirect...');
    await signInWithRedirect(auth, googleProvider);
    return { success: true, redirecting: true };
  } catch (error) {
    console.error('❌ Google Sign-In failed:', error);
    throw new Error(error.message || 'Google Sign-In failed');
  }
};

/**
 * Handle redirect result after returning from Google
 */
export const handleGoogleRedirectResult = async () => {
  try {
    console.log('🔍 Checking redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('✅ Google Sign-In successful!');
      console.log('User:', result.user.email);
      
      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified,
        },
      };
    }
    
    console.log('ℹ️ No redirect result (normal on initial page load)');
    return null;
    
  } catch (error) {
    console.error('❌ Redirect result error:', error);
    throw new Error(error.message || 'Failed to complete Google Sign-In');
  }
};
