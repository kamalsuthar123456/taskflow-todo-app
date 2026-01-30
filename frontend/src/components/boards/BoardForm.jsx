import { useState } from "react";
import client from "../../api/client";

const BoardForm = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { data } = await client.post("/boards", { title, description });
      onCreated(data.data || data);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-4 space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Board title (e.g., Personal, Work)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "..." : "Add"}
        </button>
      </div>
      <textarea
        rows={2}
        placeholder="Description (optional)"
        className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        disabled={loading}
      />
    </form>
  );
};

export default BoardForm;
