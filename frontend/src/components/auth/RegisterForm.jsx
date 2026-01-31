import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate password strength
    if (form.password.length < 6) {
      const errorMsg = "Password must be at least 6 characters";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const result = await register(form.email, form.password);
      
      if (result.success) {
        // ✅ Show ONLY ONE success toast
        toast.success('Account created! Check your email for verification 🎉', {
          duration: 3000,
        });
        
        setForm({ email: "", password: "", confirmPassword: "" });
        
        // Navigate to verify email page
        setTimeout(() => {
          navigate("/verify-email", { replace: true });
        }, 300);
      }
      
    } catch (err) {
      console.error("Registration error:", err);
      
      // User-friendly error messages
      let errorMessage = "";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else {
        errorMessage = err.message || "Failed to create account";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted mb-1.5 block">
          Confirm Password
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          placeholder="Re-enter password"
          className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          value={form.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {info && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
          <p className="text-xs text-emerald-400">{info}</p>
        </div>
      )}

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
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
