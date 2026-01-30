import { useEffect, useState } from "react";
import client from "../../api/client";
import TodoItem from "./TodoItem";

const emptyTodo = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  dueDate: ""
};

const TodoList = ({ board }) => {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(emptyTodo);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data } = await client.get(`/boards/${board._id}/todos`);
      setTodos(data.data || data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    setForm(emptyTodo);
  }, [board._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await client.post(`/boards/${board._id}/todos`, form);
      setTodos((prev) => [...prev, data.data || data]);
      setForm(emptyTodo);
    } catch (error) {
      console.error("Error creating todo:", error);
      alert("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdated = (todo) => {
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? todo : t)));
  };

  const handleDeleted = (id) => {
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  // Group todos by status
  const todosByStatus = {
    todo: todos.filter((t) => t.status === "todo"),
    "in-progress": todos.filter((t) => t.status === "in-progress"),
    done: todos.filter((t) => t.status === "done")
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">{board.title}</h2>
          {board.description && (
            <p className="text-sm text-muted">{board.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total tasks</p>
          <p className="text-2xl font-bold text-primary">{todos.length}</p>
        </div>
      </header>

      {/* Add New Todo Form */}
      <form onSubmit={handleSubmit} className="glass p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Task
        </h3>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="title"
            placeholder="Task title (e.g., Complete project)"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={200}
            disabled={submitting}
            className="md:col-span-2 rounded-lg bg-slate-900/70 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            disabled={submitting}
            className="rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            disabled={submitting}
            className="rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <textarea
          name="description"
          rows={2}
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          maxLength={1000}
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
        />

        <button
          type="submit"
          disabled={submitting || !form.title.trim()}
          className="w-full py-2.5 rounded-lg bg-primary text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Todo Columns */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
              To Do
            </h3>
            <span className="text-xs text-muted bg-slate-800 px-2 py-0.5 rounded-full">
              {todosByStatus.todo.length}
            </span>
          </div>
          <div className="space-y-3">
            {todosByStatus.todo.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
            {todosByStatus.todo.length === 0 && (
              <p className="text-xs text-muted text-center py-8">No tasks yet</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              In Progress
            </h3>
            <span className="text-xs text-muted bg-slate-800 px-2 py-0.5 rounded-full">
              {todosByStatus["in-progress"].length}
            </span>
          </div>
          <div className="space-y-3">
            {todosByStatus["in-progress"].map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
            {todosByStatus["in-progress"].length === 0 && (
              <p className="text-xs text-muted text-center py-8">No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              Done
            </h3>
            <span className="text-xs text-muted bg-slate-800 px-2 py-0.5 rounded-full">
              {todosByStatus.done.length}
            </span>
          </div>
          <div className="space-y-3">
            {todosByStatus.done.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
            {todosByStatus.done.length === 0 && (
              <p className="text-xs text-muted text-center py-8">No completed tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
