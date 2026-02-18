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
      } catch (error) {
        console.error("❌ Persistence error:", error);
      }
    };
    setupAuth();
  }, []);


  // ============================================
  // 🔥 HANDLE GOOGLE REDIRECT RESULT (NEW)
  // ============================================
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await handleGoogleRedirectResult();
        if (result && result.success) {
        }
      } catch (error) {
        console.error('❌ Redirect result error:', error);
        setError(error.message);
      }
    };
    
    checkRedirectResult();
  }, []);


  // ============================================
  // 🔥 AUTH STATE LISTENER
  // ============================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            await userAPI.sync(firebaseUser);
            
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            };
            
            setUser(userData);
            localStorage.setItem('userId', firebaseUser.uid);
            
          } catch (error) {
            console.error('❌ Failed to sync user:', error);
            
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            };
            
            setUser(userData);
            localStorage.setItem('userId', firebaseUser.uid);
            console.warn('⚠️  User authenticated but sync failed. App will still work.');
          }
        } else {
          setUser(null);
          localStorage.removeItem('userId');
        }
        
        setLoading(false);
      },
      (err) => {
        console.error("❌ Auth state error:", err);
        setError(err.message);
        setLoading(false);
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
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        try {
          const { updateProfile } = await import('firebase/auth');
          await updateProfile(userCredential.user, { displayName });
        } catch (profileError) {
          console.warn('⚠️  Failed to update display name:', profileError);
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
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
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
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        throw new Error("Please verify your email before logging in. Check your inbox (and spam folder).");
      }
      
      return { 
        success: true, 
        user: userCredential.user 
      };
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
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
      
      const result = await signInWithGooglePopup();
      
      if (result.redirecting) {
        return { success: true, redirecting: true };
      }
      
      if (result.success) {
        return { 
          success: true, 
          user: result.user 
        };
      }
      
    } catch (err) {
      console.error('❌ Google Sign-In failed:', err);
      
      let errorMessage = 'Google Sign-In failed. Please try again.';
      
      if (err.message.includes('account already exists')) {
        errorMessage = err.message;
      } else if (err.message.includes('cancelled') || err.message.includes('closed')) {
        errorMessage = 'Sign-in cancelled.';
      } else if (err.message.includes('popup blocked')) {
        errorMessage = 'Please allow popups and try again.';
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };


  // ============================================
  // 🔥 LOGOUT FUNCTION
  // ============================================
  const logout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      await signOut(auth);
      
      setUser(null);
      
      return { success: true };
      
    } catch (err) {
      console.error('❌ Logout error:', err);
      
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
        throw new Error('No Firebase user found');
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
