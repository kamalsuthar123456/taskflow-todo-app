import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../firebase";
import { userAPI } from "../api/client";
import { signInWithGooglePopup, handleGoogleRedirectResult } from "../utils/googleAuth";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // 🔥 SET FIREBASE PERSISTENCE
  // ============================================
  useEffect(() => {
    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Firebase persistence set');
      } catch (error) {
        console.error("❌ Persistence error:", error);
      }
    };
    setupAuth();
  }, []);

  // ============================================
  // 🔥 HANDLE GOOGLE REDIRECT RESULT
  // ============================================
  useEffect(() => {
  const checkRedirectResult = async () => {
    console.log('=== CHECKING GOOGLE REDIRECT RESULT ===');
    
    try {
      const result = await handleGoogleRedirectResult();
      
      if (result && result.success) {
        console.log('✅ Google redirect SUCCESS!');
        console.log('✅ User email:', result.user.email);
        console.log('✅ Waiting for auth state listener...');
      } else {
        console.log('ℹ️ No redirect result found');
      }
    } catch (error) {
      console.error('❌ Redirect result error:', error);
      setError(error.message);
    }
    
    console.log('=== REDIRECT CHECK COMPLETE ===');
  };
  
  checkRedirectResult();
}, []);

  // ============================================
  // 🔥 AUTH STATE LISTENER
  // ============================================
  useEffect(() => {
  console.log('=== SETTING UP AUTH STATE LISTENER ===');
  
  const unsubscribe = onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      console.log('🔔 Auth state changed!');
      
      if (firebaseUser) {
        console.log('✅ User authenticated:', firebaseUser.email);
        console.log('✅ Display name:', firebaseUser.displayName);
        console.log('✅ Photo URL:', firebaseUser.photoURL);
        
        try {
          console.log('🔄 Syncing with backend...');
          await userAPI.sync(firebaseUser);
          console.log('✅ Backend sync successful!');
        } catch (error) {
          console.warn('⚠️ Backend sync failed (app will still work)');
          console.error('Sync error:', error.message);
        }
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };
        
        console.log('✅ Setting user state:', userData);
        setUser(userData);
        localStorage.setItem('userId', firebaseUser.uid);
        
      } else {
        console.log('ℹ️ No user authenticated');
        setUser(null);
        localStorage.removeItem('userId');
      }
      
      setLoading(false);
      console.log('=== AUTH STATE UPDATE COMPLETE ===');
    }
  );

  return unsubscribe;
}, []);

  // ============================================
  // 🔥 REGISTER FUNCTION
  // ============================================
  const register = async (email, password, displayName = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        try {
          const { updateProfile } = await import('firebase/auth');
          await updateProfile(userCredential.user, { displayName });
        } catch (profileError) {
          console.warn('⚠️ Failed to update display name:', profileError);
        }
      }
      
      try {
        await sendEmailVerification(userCredential.user, {
          url: window.location.origin + '/dashboard',
          handleCodeInApp: true,
        });
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
      }
      
      return { 
        success: true, 
        message: "Account created! Check your email to verify.",
        shouldVerifyEmail: true 
      };
      
    } catch (err) {
      console.error('❌ Registration failed:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already registered. Please login instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Check your internet connection.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔥 LOGIN FUNCTION
  // ============================================
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        throw new Error("Please verify your email before logging in.");
      }
      
      return { 
        success: true, 
        user: userCredential.user 
      };
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      switch (err.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Check your internet connection.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔥 GOOGLE SIGN-IN FUNCTION
  // ============================================
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("the request come to AuthContext");
      
      const result = await signInWithGooglePopup();
      
      if (result.redirecting) {
        // User is being redirected to Google
        // Don't setLoading(false) - page will reload
        return { success: true, redirecting: true };
      }
      
      return { success: true };
      
    } catch (err) {
      console.error('❌ Google Sign-In failed:', err);
      
      let errorMessage = 'Google Sign-In failed. Please try again.';
      
      if (err.message.includes('account already exists')) {
        errorMessage = err.message;
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      // Only set loading false if not redirecting
      setLoading(false);
    }
  };

  // ============================================
  // 🔥 LOGOUT FUNCTION
  // ============================================
  const logout = async () => {
    try {
      await signOut(auth);
      
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      
      return { success: true };
      
    } catch (err) {
      console.error('❌ Logout error:', err);
      
      // Force logout anyway
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      
      return { 
        success: false, 
        error: err.message 
      };
    }
  };

  // ============================================
  // 🔥 RESEND VERIFICATION EMAIL
  // ============================================
  const resendVerificationEmail = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user found');
      }
      
      if (currentUser.emailVerified) {
        throw new Error('Email already verified');
      }
      
      await sendEmailVerification(currentUser, {
        url: window.location.origin + '/dashboard',
        handleCodeInApp: true,
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Error resending email:', error);
      throw error;
    }
  };

  // ============================================
  // 🔥 LOADING SCREEN
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a1f3a] to-[#0f1729] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="mt-4 text-white text-xl font-bold">Loading TaskFlow...</div>
          <div className="mt-2 text-white/60 text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        register, 
        login, 
        logout,
        loginWithGoogle,
        resendVerificationEmail 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
