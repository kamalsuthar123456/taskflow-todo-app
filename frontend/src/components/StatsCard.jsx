import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const StatsCard = ({ icon, label, value, color, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6"
    >
      {/* Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${color} rounded-xl`}>
            <div className="w-6 h-6 text-white">
              {icon}
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
