import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import GoogleSignInButton from "./GoogleSignInButton";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form.email, form.password);
      
      if (result.success) {
        toast.success('Welcome back! 👋', { duration: 2000 });
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 300);
      }
      
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.message.includes("verify your email")) {
        toast.error("Please verify your email first! 📧", { duration: 4000 });
        setError("Please verify your email before logging in");
        
        setTimeout(() => {
          navigate("/verify-email");
        }, 1500);
      } else {
        let errorMessage = "Failed to login";
        
        if (err.code === "auth/invalid-credential") {
          errorMessage = "Invalid email or password";
        } else if (err.code === "auth/user-not-found") {
          errorMessage = "No account found with this email";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "Incorrect password";
        } else if (err.code === "auth/too-many-requests") {
          errorMessage = "Too many failed attempts. Try again later";
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Password
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Enter your password"
            className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-primary hover:bg-indigo-500 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      {/* ✅ GOOGLE SIGN-IN BUTTON - MOVED HERE (AFTER SIGN IN BUTTON) */}
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1 h-px bg-white/10"></div>
        <span className="text-xs text-muted">OR</span>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>

      <GoogleSignInButton mode="signin" />
    </form>
  );
};

export default LoginForm;
