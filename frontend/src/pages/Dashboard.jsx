import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter,
  CheckCircle2, 
  Clock,
  BarChart3,
  Sparkles,
  Flame,
  Calendar,
  LogOut,
  Trash2,
  Edit3,
  MoreVertical,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const habitTypes = [
    { id: 'gym', name: 'Gym Workout', color: 'from-red-500 to-orange-500', emoji: '💪' },
    { id: 'running', name: 'Running', color: 'from-green-500 to-emerald-500', emoji: '🏃' },
    { id: 'coding', name: 'Coding', color: 'from-blue-500 to-cyan-500', emoji: '💻' },
    { id: 'reading', name: 'Reading', color: 'from-purple-500 to-pink-500', emoji: '📚' },
    { id: 'meditation', name: 'Meditation', color: 'from-indigo-500 to-purple-500', emoji: '🧘' },
    { id: 'meal', name: 'Healthy Meal', color: 'from-yellow-500 to-orange-500', emoji: '🥗' }
  ];

  useEffect(() => {
    if (user) {
      fetchBoards();
      loadHabits();
    }
  }, [user]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await client.get('/boards');
      setBoards(response.data.data || []);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const loadHabits = () => {
    const saved = localStorage.getItem('daily-habits');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  };

  const saveHabits = (newHabits) => {
    localStorage.setItem('daily-habits', JSON.stringify(newHabits));
    setHabits(newHabits);
  };

  const toggleHabit = (habitId) => {
    const today = new Date().toDateString();
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const completed = h.completedDates?.includes(today);
        if (!completed) {
          toast.success(`${h.emoji} ${h.name} completed!`);
        }
        return {
          ...h,
          completedDates: completed 
            ? h.completedDates.filter(d => d !== today)
            : [...(h.completedDates || []), today]
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const addHabit = (habitType) => {
    const newHabit = {
      id: Date.now().toString(),
      type: habitType.id,
      name: habitType.name,
      color: habitType.color,
      emoji: habitType.emoji,
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    saveHabits([...habits, newHabit]);
    setShowHabitModal(false);
    toast.success(`${habitType.emoji} ${habitType.name} added!`);
  };

  const deleteHabit = (habitId) => {
    const updated = habits.filter(h => h.id !== habitId);
    saveHabits(updated);
    toast.success('Habit removed!');
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) {
      toast.error("Please enter a board title");
      return;
    }

    const loadingToast = toast.loading('Creating board...');

    try {
      setLoading(true);
      const response = await client.post('/boards', {
        title: newBoardTitle,
        description: newBoardDescription
      });

      setBoards([response.data.data, ...boards]);
      setNewBoardTitle("");
      setNewBoardDescription("");
      setShowCreateModal(false);
      
      toast.success('Board created successfully!', { id: loadingToast });
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error('Failed to create board', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBoard = async () => {
    if (!newBoardTitle.trim()) {
      toast.error("Please enter a board title");
      return;
    }

    const loadingToast = toast.loading('Updating board...');

    try {
      setLoading(true);
      const response = await client.put(`/boards/${selectedBoard._id}`, {
        title: newBoardTitle,
        description: newBoardDescription
      });

      setBoards(boards.map(b => 
        b._id === selectedBoard._id ? response.data.data : b
      ));
      
      setNewBoardTitle("");
      setNewBoardDescription("");
      setShowEditModal(false);
      setSelectedBoard(null);
      
      toast.success('Board updated successfully!', { id: loadingToast });
    } catch (error) {
      console.error("Error updating board:", error);
      toast.error('Failed to update board', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    const loadingToast = toast.loading('Deleting board...');

    try {
      await client.delete(`/boards/${selectedBoard._id}`);
      
      setBoards(boards.filter(b => b._id !== selectedBoard._id));
      setShowDeleteConfirm(false);
      setSelectedBoard(null);
      
      toast.success('Board deleted successfully!', { id: loadingToast });
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error('Failed to delete board', { id: loadingToast });
    }
  };

  const openEditModal = (board) => {
    setSelectedBoard(board);
    setNewBoardTitle(board.title);
    setNewBoardDescription(board.description || "");
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (board) => {
    setSelectedBoard(board);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out successfully!');
    }
  };

  const todayStreak = habits.filter(h => 
    h.completedDates?.includes(new Date().toDateString())
  ).length;

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* ✅ FIXED TOAST POSITION */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: '80px',
          right: '20px',
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 3000,
          className: '',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            maxWidth: '400px',
          },
          success: {
            duration: 2000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#6366f1',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#6366f1',
            },
          },
        }}
      />

      {/* Fixed Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">TaskFlow</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:block">
                {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">👋</span>
                Welcome back, {user?.email?.split('@')[0]}!
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                {todayStreak > 0 ? `🔥 ${todayStreak} habits completed today!` : "Let's make today productive ✨"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Board
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 sm:p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Boards</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{boards.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 sm:p-6 hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-1">Active Tasks</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 sm:p-6 hover:border-green-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-1">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 sm:p-6 hover:border-pink-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-1">Streak</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{todayStreak}</p>
            </motion.div>
          </div>

          {/* Daily Habits */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Today's Habits
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHabitModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Habit
              </motion.button>
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                <p className="text-slate-400 mb-4">No habits yet. Add your first habit!</p>
                <button
                  onClick={() => setShowHabitModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + Add Habit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <AnimatePresence>
                  {habits.map((habit, index) => {
                    const today = new Date().toDateString();
                    const isCompleted = habit.completedDates?.includes(today);

                    return (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleHabit(habit.id)}
                          className={`w-full relative p-4 rounded-2xl border-2 transition-all ${
                            isCompleted 
                              ? 'bg-gradient-to-br ' + habit.color + ' border-transparent shadow-lg' 
                              : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`text-3xl ${isCompleted ? 'animate-bounce' : ''}`}>
                              {habit.emoji}
                            </div>
                            <span className={`text-xs font-medium text-center ${
                              isCompleted ? 'text-white' : 'text-slate-400'
                            }`}>
                              {habit.name}
                            </span>
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHabit(habit.id);
                          }}
                          className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filter
            </motion.button>
          </div>

          {/* Boards Section */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              My Boards
              <span className="text-sm font-normal text-slate-400">
                ({filteredBoards.length})
              </span>
            </h3>

            {filteredBoards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  {searchQuery ? "No boards found" : "No boards yet"}
                </h4>
                <p className="text-slate-400 mb-6">
                  {searchQuery ? "Try a different search term" : "Create your first board to get started!"}
                </p>
                {!searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Create Your First Board
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredBoards.map((board, index) => (
                  <motion.div
                    key={board._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500 transition-all relative group"
                  >
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === board._id ? null : board._id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {openMenuId === board._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden"
                          >
                            <button
                              onClick={() => openEditModal(board)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center gap-3 text-white"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Board
                            </button>
                            <button
                              onClick={() => openDeleteModal(board)}
                              className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Board
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2 pr-8">
                      {board.title}
                    </h4>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {board.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Created: {new Date(board.createdAt).toLocaleDateString()}</span>
                      <span className="px-2 py-1 bg-slate-700 rounded">0 tasks</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Create New Board
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="e.g., Work Projects"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="What's this board for?"
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardTitle("");
                    setNewBoardDescription("");
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={loading || !newBoardTitle.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Board Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Edit Board
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="e.g., Work Projects"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="What's this board for?"
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setNewBoardTitle("");
                    setNewBoardDescription("");
                    setSelectedBoard(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBoard}
                  disabled={loading || !newBoardTitle.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Delete Board?
              </h2>
              
              <p className="text-slate-400 text-center mb-6">
                Are you sure you want to delete "<span className="text-white font-semibold">{selectedBoard?.title}</span>"? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedBoard(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showHabitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Add Daily Habit
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {habitTypes.map((type, index) => (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addHabit(type)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${type.color} border-2 border-transparent hover:border-white/20 transition-all`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">{type.emoji}</div>
                      <span className="text-sm font-medium text-white text-center">
                        {type.name}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setShowHabitModal(false)}
                className="w-full mt-6 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
