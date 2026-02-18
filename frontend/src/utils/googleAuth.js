import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from "firebase/auth";
import { auth } from "../firebase";

// ============================================
// 🔥 GOOGLE PROVIDER SETUP
// ============================================

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

googleProvider.addScope('email');
googleProvider.addScope('profile');

// ============================================
// 🔥 DEVICE DETECTION
// ============================================

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// ============================================
// 🔥 SMART GOOGLE SIGN-IN
// ============================================

export const signInWithGooglePopup = async () => {
  try {

    // ✅ Mobile → use redirect (no popup COOP issue)
    if (isMobile()) {
      await signInWithRedirect(auth, googleProvider);
      return { success: true, redirecting: true };
    }

    // ✅ Desktop → use popup
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
    // ✅ Silently ignore COOP warning — it does NOT break sign-in
    if (
      error.message?.includes('Cross-Origin-Opener-Policy') ||
      error.message?.includes('window.closed') ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      // Do nothing — popup still works despite the warning
      return { success: false, cancelled: true };
    }

    const errorCode = error.code;
    const errorMessage = error.message;

    if (errorCode === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      throw new Error(
        `An account already exists with ${email}. Please sign in using your original method.`
      );
    }

    if (errorCode === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    }

    if (errorCode === 'auth/popup-blocked') {
      // ✅ Fallback to redirect if popup is blocked
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirecting: true };
      } catch (redirectError) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
    }

    if (errorCode === 'auth/network-request-failed') {
      throw new Error('Network error. Check your internet connection.');
    }

    throw new Error(errorMessage || 'Google Sign-In failed. Please try again.');
  }
};

// ============================================
// 🔥 HANDLE REDIRECT RESULT
// ============================================

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
