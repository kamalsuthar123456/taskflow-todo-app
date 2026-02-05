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
import { userAPI } from "../api/client";  // ✅ CHANGED: Use userAPI from client

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

  // Set persistence
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

  // Auth state listener
  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log('🔄 Auth state changed:', firebaseUser?.email || 'No user');
        
        if (firebaseUser) {
          try {
            // ✅ Sync user with backend
            await userAPI.sync(firebaseUser);
            
            // ✅ Set user in state
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            });
            
            console.log('✅ User logged in and synced:', firebaseUser.email);
          } catch (error) {
            console.error('❌ Failed to sync user:', error);
            
            // Still set user even if sync fails
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            });
          }
        } else {
          // User logged out
          setUser(null);
          localStorage.removeItem('userId');
          console.log('👋 User logged out');
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

  // Register function
  const register = async (email, password) => {
    try {
      setLoading(true);
      console.log('📝 Registering user:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Sync with backend
      await userAPI.sync(userCredential.user);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      console.log('✅ Registration successful');
      
      return { 
        success: true, 
        message: "Account created! Check your email.",
        shouldVerifyEmail: true 
      };
    } catch (err) {
      console.error('❌ Registration failed:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Logging in:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        throw new Error("Please verify your email before logging in");
      }

      // Sync with backend
      await userAPI.sync(userCredential.user);

      console.log('✅ Login successful');
      
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('❌ Login failed:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear user state
      setUser(null);
      
      console.log('✅ Logged out successfully');
      
      return { success: true };
    } catch (err) {
      console.error('❌ Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="mt-4 text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
