import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user && user.emailVerified) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full items-center">
        {/* Left side - Branding */}
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <h1 className="text-3xl font-bold">TaskFlow</h1>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
            Organize your day with
            <span className="text-primary"> smart boards</span>
          </h2>
          
          <p className="text-muted text-lg">
            Lightweight, board-based todo app built with React, Node.js, MongoDB, and Firebase authentication.
          </p>

          <div className="glass p-5 flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Your Productivity Superpower 💪</h3>
              <p className="text-sm text-muted">
                Modern task dashboard with habit tracking, smart priorities. Built to help you crush goals and stay consistent. Let's make every day count! ✨
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="glass px-8 py-8 max-w-md w-full mx-auto">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-slate-900/70 rounded-full p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted hover:text-slate-100"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted hover:text-slate-100"
              }`}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
