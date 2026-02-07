import { useAuth } from "../context/AuthContext";
import { LogOut, Plus, Sparkles, User, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Navbar = ({ onAddTaskClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        toast.success('See you soon! 👋', {
          duration: 2000,
          icon: '👋',
        });
        
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 300);
      } else {
        toast.error(result.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Something went wrong during logout');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-2xl shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ✨ ENHANCED LOGO */}
          <motion.div 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group relative"
            whileHover="hover"
          >
            {/* Animated Background Glow */}
            <motion.div 
              className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Logo Container with 3D Effect */}
            <motion.div 
              className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-2 ring-white/10 overflow-hidden"
              variants={{
                hover: { 
                  scale: 1.05,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated Gradient Overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Logo Text with Glow */}
              <span className="relative text-xl font-black text-white tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                TF
              </span>
              
              {/* Corner Sparkle */}
              <motion.div
                className="absolute top-1 right-1"
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            </motion.div>

            {/* Brand Text with Gradient */}
            <div className="hidden sm:block">
              <motion.h1 
                className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg"
                variants={{
                  hover: { 
                    backgroundPosition: ['0%', '100%'],
                    transition: { duration: 1 }
                  }
                }}
              >
                TaskFlow
              </motion.h1>
              <p className="text-[10px] font-medium text-purple-300/70 tracking-wide">
                Organize • Focus • Achieve
              </p>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* User Profile Card */}
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl backdrop-blur-sm hover:border-white/20 transition-all group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Avatar with Online Indicator */}
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-white/20">
                  <span className="text-sm font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online Status Dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-950 shadow-lg shadow-green-400/50" />
              </div>

              {/* User Info */}
              <div className="hidden lg:block">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {user?.displayName || user?.email?.split('@')[0]}
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                  </motion.div>
                </div>
                <div className="text-xs text-purple-300/60 font-medium">
                  Member
                </div>
              </div>
            </motion.div>

            {/* Add Task Button - Enhanced */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddTaskClick}
              className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all overflow-hidden group"
            >
              {/* Animated Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
              
              <Plus className="w-4 h-4 relative z-10" />
              <span className="hidden sm:inline relative z-10">Add Task</span>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            </motion.button>

            {/* Logout Button - Enhanced */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 rounded-xl transition-all font-semibold text-sm shadow-lg backdrop-blur-sm group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {/* User Avatar (Mobile) */}
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-white/20">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-950" />
            </div>

            {/* Hamburger Menu */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 space-y-2"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onAddTaskClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add New Task
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-red-500/20 border border-white/10 text-white rounded-xl font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
