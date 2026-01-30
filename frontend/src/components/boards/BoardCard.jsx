
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  MoreVertical, 
  Trash2, 
  Edit, 
  ArrowRight,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useState } from "react";

const BoardCard = ({ board, index, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const totalTodos = board.todos?.length || 0;
  const completedTodos = board.todos?.filter(t => t.completed).length || 0;
  const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-indigo-500 to-purple-500",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/board/${board._id}`)}
      className="group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-slate-600 transition-all overflow-hidden"
    >
      {/* Gradient Orb */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity`}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
            <span className="text-white text-lg font-bold">
              {board.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
          {board.name}
        </h3>
        
        {/* Description */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {board.description || "No description"}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`h-full bg-gradient-to-r ${gradient}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedTodos}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Circle className="w-4 h-4" />
              <span>{totalTodos - completedTodos}</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-16 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="w-full px-4 py-3 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BoardCard;
