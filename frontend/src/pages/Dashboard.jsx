import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  CheckCircle2, 
  Circle,
  Sparkles,
  Flame,
  Trash2,
  X,
  ListTodo,
  Plus
} from "lucide-react";
import Navbar from "../components/Navbar";

// ========================================
// 🎨 UTILITY FUNCTIONS
// ========================================

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function formatDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getStreakDays(completionsByDay) {
  const today = startOfDay(new Date());
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = formatDateKey(day);
    if (completionsByDay[key]) streak += 1;
    else break;
  }
  return streak;
}

const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };

// ========================================
// 🎨 UI COMPONENTS
// ========================================

function SceneCard({ children, className }) {
  return (
    <div
      className={cx(
        "relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        "shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none" style={{
        backgroundImage:
          "radial-gradient(900px 500px at 20% 10%, rgba(168,85,247,.30), transparent 60%), radial-gradient(800px 500px at 80% 20%, rgba(34,211,238,.22), transparent 60%), radial-gradient(800px 600px at 30% 90%, rgba(59,130,246,.18), transparent 60%)",
      }} />
      <div className="relative">{children}</div>
    </div>
  );
}

function Tilt({ children, className }) {
  const [style, setStyle] = useState({});

  function onMove(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
    });
  }

  function onLeave() {
    setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" });
  }

  return (
    <div
      className={cx("[transform-style:preserve-3d] transition-transform duration-150", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Tilt>
      <SceneCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">{label}</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">{value}</div>
          </div>
          <div
            className={cx(
              "h-11 w-11 rounded-xl flex items-center justify-center",
              "border border-white/10 bg-white/5",
              "shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            )}
            style={{ boxShadow: `0 14px 40px ${accent}` }}
          >
            <Icon className="h-5 w-5" style={{ color: "rgba(255,255,255,0.9)" }} />
          </div>
        </div>
      </SceneCard>
    </Tilt>
  );
}

function PriorityPill({ value }) {
  const map = {
    low: { label: "Low", cls: "bg-emerald-500/10 text-emerald-200 border-emerald-400/20" },
    medium: { label: "Medium", cls: "bg-amber-500/10 text-amber-200 border-amber-400/20" },
    high: { label: "High", cls: "bg-rose-500/10 text-rose-200 border-rose-400/20" },
  };
  const p = map[value] || map.medium;
  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", p.cls)}>
      {p.label}
    </span>
  );
}

function ModalShell({ open, onClose, title, description, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-lg"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={spring}
          >
            <SceneCard className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
                  {description && <p className="mt-1 text-sm text-white/65">{description}</p>}
                </div>
                <button
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5">{children}</div>
            </SceneCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add Task Modal
function AddTaskModal({ open, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, priority });
    setTitle("");
    setPriority("medium");
    onClose();
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Create New Task"
      description="Give it a title and pick priority. Smooth animations included."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="text-xs font-semibold text-white/70" htmlFor="taskTitle">
            Task title
          </label>
          <div className="mt-2">
            <input
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish UI polish"
              className={cx(
                "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3",
                "text-sm text-white placeholder:text-white/40",
                "outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-400/30 transition"
              )}
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-white/70">Priority</div>
            <div className="mt-2 flex items-center gap-2">
              {[
                { k: "low", label: "Low" },
                { k: "medium", label: "Med" },
                { k: "high", label: "High" },
              ].map((p) => (
                <button
                  key={p.k}
                  type="button"
                  onClick={() => setPriority(p.k)}
                  className={cx(
                    "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    "bg-white/[0.03] hover:bg-white/[0.06] border-white/10",
                    priority === p.k && "ring-4 ring-violet-500/20 border-violet-400/30"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-white/70">Preview</div>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-sm font-semibold">{title || "Your task title"}</div>
              <div className="mt-2"><PriorityPill value={priority} /></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-violet-500/90 hover:bg-violet-500 text-white shadow-[0_12px_30px_rgba(139,92,246,0.35)] transition"
            type="submit"
          >
            Create
          </motion.button>
        </div>
      </form>
    </ModalShell>
  );
}

// Habit Modal
function AddHabitModal({ open, onClose, onAdd }) {
  const habitTypes = [
    { id: 'gym', name: 'Gym Workout', color: 'from-red-500 to-orange-500', emoji: '💪' },
    { id: 'running', name: 'Running', color: 'from-green-500 to-emerald-500', emoji: '🏃' },
    { id: 'coding', name: 'Coding', color: 'from-blue-500 to-cyan-500', emoji: '💻' },
    { id: 'reading', name: 'Reading', color: 'from-purple-500 to-pink-500', emoji: '📚' },
    { id: 'meditation', name: 'Meditation', color: 'from-indigo-500 to-purple-500', emoji: '🧘' },
    { id: 'meal', name: 'Healthy Meal', color: 'from-yellow-500 to-orange-500', emoji: '🥗' }
  ];

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add Daily Habit"
      description="Pick a template — it will create a task instantly."
    >
      <div className="grid grid-cols-2 gap-3">
        {habitTypes.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onAdd(type);
              onClose();
            }}
            className={`relative p-4 rounded-2xl bg-gradient-to-br ${type.color} border-2 border-transparent hover:border-white/20 transition-all overflow-hidden`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl">{type.emoji}</div>
              <span className="text-sm font-medium text-white text-center">{type.name}</span>
              <span className="text-[10px] text-white/70">Tap to add</span>
            </div>
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 border border-white/10 flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </motion.button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-white font-semibold transition"
      >
        Cancel
      </button>
    </ModalShell>
  );
}

// Task Row
function TaskRow({ task, onToggle, onDelete }) {
  const done = !!task.completed;
  return (
    <motion.div
      layout
      transition={spring}
      className={cx(
        "group rounded-2xl border border-white/10 bg-white/[0.03]",
        "hover:bg-white/[0.05] transition",
        done && "opacity-75"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => onToggle(task.id)}
          className={cx(
            "mt-0.5 h-10 w-10 rounded-xl border border-white/10 bg-black/20",
            "hover:bg-white/5 transition flex items-center justify-center",
            "shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          )}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          ) : (
            <Circle className="h-5 w-5 text-white/60" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={cx("text-sm sm:text-base font-semibold tracking-tight", done && "line-through text-white/50")}>
                {task.title}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PriorityPill value={task.priority} />
                <span className="text-[11px] text-white/45">{done ? "Completed" : "Active"}</span>
              </div>
            </div>

            <button
              onClick={() => onDelete(task.id)}
              className={cx(
                "opacity-0 group-hover:opacity-100 transition",
                "h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-rose-500/10 hover:border-rose-400/20",
                "flex items-center justify-center"
              )}
            >
              <Trash2 className="h-4 w-4 text-white/70 group-hover:text-rose-200" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ========================================
// 🎯 MAIN DASHBOARD
// ========================================

const Dashboard = () => {
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskQuery, setTaskQuery] = useState("");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isHabitOpen, setIsHabitOpen] = useState(false);
  
  const [completionsByDay, setCompletionsByDay] = useState(() => {
    const saved = localStorage.getItem('completions-by-day');
    if (saved) return JSON.parse(saved);
    const t = new Date();
    const y = new Date();
    y.setDate(t.getDate() - 1);
    return {
      [formatDateKey(t)]: true,
      [formatDateKey(y)]: true,
    };
  });

  // Load tasks
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Save tasks
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('completions-by-day', JSON.stringify(completionsByDay));
  }, [completionsByDay]);

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const active = total - done;
    const streak = getStreakDays(completionsByDay);
    return { total, done, active, streak };
  }, [tasks, completionsByDay]);

  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (taskFilter === "active") return !t.completed;
        if (taskFilter === "done") return t.completed;
        return true;
      })
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true));
  }, [tasks, taskFilter, taskQuery]);

  function addTask({ title, priority }) {
    const newTask = { id: uid(), title, completed: false, priority };
    setTasks((prev) => [newTask, ...prev]);
  }

  function addHabitAsTask(habitType) {
    const newTask = { 
      id: uid(), 
      title: habitType.name + " 🎯", 
      completed: false, 
      priority: 'medium',
      isHabit: true,
      emoji: habitType.emoji
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, completed: !t.completed };
        if (next.completed) {
          const key = formatDateKey(new Date());
          setCompletionsByDay((m) => ({ ...m, [key]: true }));
        }
        return next;
      })
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(168,85,247,0.22),transparent_60%),radial-gradient(900px_600px_at_80%_10%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(1000px_700px_at_20%_90%,rgba(59,130,246,0.10),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(3,7,18,1))] text-slate-100">
      
      {/* ✅ ONLY NAVBAR COMPONENT - NO DUPLICATE CODE */}
      <Navbar onAddTaskClick={() => setIsAddTaskOpen(true)} />

      {/* Main Content - NO NAVBAR CODE HERE */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SceneCard className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs text-white/60">
                  <Sparkles className="h-4 w-4" />
                  Today
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">suthargaurishankar398</span>
                </h1>
                <p className="mt-1 text-sm text-white/65">
                  Let's make today productive
                </p>
              </div>

              <motion.div
                className="hidden sm:block"
                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="h-16 w-16 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(255,255,255,0.05),rgba(255,255,255,0.02))] border border-white/10 shadow-[0_22px_70px_rgba(34,211,238,0.15)]" />
              </motion.div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                icon={ListTodo}
                label="Total"
                value={stats.total}
                accent="rgba(168,85,247,0.22)"
              />
              <StatCard
                icon={Circle}
                label="Active"
                value={stats.active}
                accent="rgba(34,211,238,0.18)"
              />
              <StatCard
                icon={CheckCircle2}
                label="Done"
                value={stats.done}
                accent="rgba(16,185,129,0.16)"
              />
            </div>
          </SceneCard>
        </motion.div>

        {/* Streak Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <SceneCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs text-white/60">
                  <Flame className="h-4 w-4" />
                  Streak
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight">{stats.streak} days</div>
                <div className="mt-1 text-sm text-white/65">Finish at least 1 task daily.</div>
              </div>

              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <div className="h-16 w-16 rounded-full border border-white/10 bg-white/[0.02] shadow-[0_18px_60px_rgba(139,92,246,0.20)]" />
                <div className="absolute inset-0 rounded-full border border-white/10 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
              </motion.div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Today's progress</span>
                <span>{stats.done}/{stats.total}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500/90 via-fuchsia-500/80 to-cyan-400/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  onClick={clearCompleted}
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition"
                >
                  Clear completed
                </button>

                <button
                  onClick={() => setIsHabitOpen(true)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition"
                >
                  Add daily habit
                </button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAddTaskOpen(true)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-violet-500/20 hover:bg-violet-500/25 border border-violet-300/20 transition"
                >
                  Quick add
                </motion.button>
              </div>
            </div>
          </SceneCard>
        </motion.div>

        {/* Tasks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          {/* Filters */}
          <div className="lg:col-span-4">
            <SceneCard className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/60">Focus</div>
                  <div className="mt-1 text-xl font-bold tracking-tight">Filters</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { k: "all", label: "All" },
                  { k: "active", label: "Active" },
                  { k: "done", label: "Done" },
                ].map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setTaskFilter(b.k)}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      "bg-white/[0.03] hover:bg-white/[0.06] border-white/10",
                      taskFilter === b.k && "ring-4 ring-violet-500/20 border-violet-400/30"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-white/70">Search</div>
                <div className="mt-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    value={taskQuery}
                    onChange={(e) => setTaskQuery(e.target.value)}
                    placeholder="Search tasks…"
                    className={cx(
                      "w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 py-3",
                      "text-sm text-white placeholder:text-white/40",
                      "outline-none focus:ring-4 focus:ring-cyan-500/15 focus:border-cyan-400/30 transition"
                    )}
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-white/60">Tip</div>
                  <div className="mt-1 text-sm font-semibold">Tap tasks to complete</div>
                  <div className="mt-1 text-sm text-white/65">
                    Completing at least one task each day keeps your streak alive.
                  </div>
                </div>
              </div>
            </SceneCard>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-8">
            <SceneCard className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white/60">Tasks</div>
                  <div className="mt-1 text-xl font-bold tracking-tight">Your list</div>
                </div>
                <div className="text-xs text-white/60">
                  Showing <span className="text-white/80">{filteredTasks.length}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </AnimatePresence>

                {filteredTasks.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <ListTodo className="h-5 w-5 text-white/70" />
                    </div>
                    <div className="mt-3 text-sm font-semibold">No tasks found</div>
                    <div className="mt-1 text-sm text-white/60">Try a different filter or add a new task.</div>
                    <button
                      onClick={() => setIsAddTaskOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Add task
                    </button>
                  </div>
                )}
              </div>
            </SceneCard>
          </div>
        </motion.div>

        <footer className="py-10">
          <div className="text-center text-xs text-white/45">
            TaskFlow Dashboard — Built with React & Framer Motion
          </div>
        </footer>
      </main>

      {/* Modals */}
      <AddTaskModal open={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} onAdd={addTask} />
      <AddHabitModal open={isHabitOpen} onClose={() => setIsHabitOpen(false)} onAdd={addHabitAsTask} />
    </div>
  );
};

export default Dashboard;
