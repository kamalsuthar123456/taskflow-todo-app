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
        // Silent error
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
      await client.post("/users/sync", {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        emailVerified: firebaseUser.emailVerified
      });
    } catch (err) {
      // Silent error - don't block user flow
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await syncUserToMongoDB(userCredential.user);
      await sendEmailVerification(userCredential.user);
      
      // ❌ REMOVED navigate from here - let RegisterForm handle it
      // ❌ REMOVED toast from here - let RegisterForm handle it
      
      return { 
        success: true, 
        message: "Account created! Check your email.",
        shouldVerifyEmail: true 
      };
    } catch (err) {
      // ❌ REMOVED toast - let RegisterForm handle errors
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
      
      // ❌ REMOVED navigate from here - let LoginForm handle it
      // ❌ REMOVED toast from here - let LoginForm handle it
      
      return { success: true, user: userCredential.user };
    } catch (err) {
      // ❌ REMOVED toast - let LoginForm handle errors
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      
      // ❌ REMOVED toast from here - let Dashboard handle it
      // ❌ REMOVED navigate from here - let Dashboard handle it
      
      return { success: true };
    } catch (err) {
      // ❌ REMOVED toast - let Dashboard handle errors
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
