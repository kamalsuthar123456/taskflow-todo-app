import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import client from "../api/client";

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
  const navigate = useNavigate();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Persistence error:", error);
      }
    };
    setupAuth();
  }, []);

  useEffect(() => {
    let unsubscribed = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!unsubscribed) {
          setUser(currentUser);
          setLoading(false);
        }
      },
      (err) => {
        if (!unsubscribed) {
          console.error("Auth state error:", err);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

 const syncUserToMongoDB = async (firebaseUser) => {
  try {
    console.log("🔄 Syncing user to MongoDB:", firebaseUser.email);
    
    const response = await client.post("/users/sync", {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || "",
      emailVerified: firebaseUser.emailVerified
    });
    
    console.log("✅ User synced successfully:", response.data);
    
  } catch (err) {
    console.error("❌ MongoDB sync error:", {
      url: err.config?.url,
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      fullError: err.response?.data
    });
  }
};


  const register = async (email, password) => {
    try {
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await syncUserToMongoDB(userCredential.user);
      await sendEmailVerification(userCredential.user);
      
      return { 
        success: true, 
        message: "Account created! Check your email.",
        shouldVerifyEmail: true 
      };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        throw new Error("Please verify your email before logging in");
      }

      await syncUserToMongoDB(userCredential.user);

      console.log("✅ Login successful");
      
      return { success: true, user: userCredential.user };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Logging out...");
      
      // ✅ Clear ALL storage
      localStorage.clear();
      sessionStorage.clear();
      
      // ✅ Sign out from Firebase
      await signOut(auth);
      
      // ✅ Clear user state
      setUser(null);
      
      console.log("✅ Logged out successfully");
      
      return { success: true };
    } catch (err) {
      console.error("❌ Logout error:", err);
      return { success: false, error: err.message };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
