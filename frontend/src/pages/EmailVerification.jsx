import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const { user, logout, resendVerificationEmail } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    
    try {
      // Reload Firebase user to check verification status
      await auth.currentUser?.reload();
      
      // Check if verified now
      if (auth.currentUser?.emailVerified) {
        toast.success('Email verified! Redirecting...', { duration: 2000 });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Check your inbox.', { duration: 3000 });
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Failed to resend email. Try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
          <Mail className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Verify your email</h2>
        
        <p className="text-slate-400 mb-2">
          We sent a verification link to:
        </p>
        <p className="text-indigo-400 font-semibold mb-6">{user?.email}</p>

        <p className="text-slate-400 text-sm mb-8">
          Please check your inbox (and spam folder) and click the verification link, then click the button below.
        </p>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={checking}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? "Checking..." : "I've verified my email"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResend}
            disabled={resending}
            className="w-full py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </motion.button>

          <button
            onClick={logout}
            className="w-full py-3 text-slate-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
