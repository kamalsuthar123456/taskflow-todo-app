import { useState } from "react";
import client from "../../api/client";

const priorityStyles = {
  low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-rose-500/15 text-rose-300 border-rose-500/30"
};

const TodoItem = ({ todo, onUpdated, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const cycleStatus = async () => {
    const statusOrder = ["todo", "in-progress", "done"];
    const currentIndex = statusOrder.indexOf(todo.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    setLoading(true);
    try {
      const { data } = await client.put(
        `/boards/${todo.boardId}/todos/${todo._id}`,
        {
          ...todo,
          status: nextStatus
        }
      );
      onUpdated(data.data || data);
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async () => {
    if (!confirm("Delete this task?")) return;

    setLoading(true);
    try {
      await client.delete(`/boards/${todo.boardId}/todos/${todo._id}`);
      onDeleted(todo._id);
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const isOverdue = () => {
    if (!todo.dueDate || todo.status === "done") return false;
    return new Date(todo.dueDate) < new Date();
  };

  return (
    <div
      className={`rounded-xl bg-slate-900/70 border border-white/10 p-3 space-y-2 hover:border-white/20 transition-all ${
        loading ? "opacity-50" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={cycleStatus}
          disabled={loading}
          className="text-left flex-1 group"
          title="Click to change status"
        >
          <h4 className="text-sm font-semibold group-hover:text-primary transition-colors leading-snug">
            {todo.title}
          </h4>
        </button>
        <button
          onClick={deleteTodo}
          disabled={loading}
          className="text-muted hover:text-red-400 transition-colors p-1"
          title="Delete task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {todo.description && (
        <p className="text-xs text-muted leading-relaxed line-clamp-3">
          {todo.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span
          className={`px-2 py-1 rounded-md border text-[10px] font-medium uppercase tracking-wide ${
            priorityStyles[todo.priority]
          }`}
        >
          {todo.priority}
        </span>

        {todo.dueDate && (
          <div
            className={`text-[10px] flex items-center gap-1 ${
              isOverdue() ? "text-red-400" : "text-muted"
            }`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isOverdue() && <span className="font-semibold">Overdue: </span>}
            {formatDate(todo.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
