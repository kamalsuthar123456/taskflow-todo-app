import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TodoList from "../components/todos/TodoList";
import Navbar from "../components/Navbar";
import client from "../api/client";

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const { data } = await client.get("/boards");
      setBoards(data.data || data);
      if (!activeBoard && (data.data || data).length > 0) {
        setActiveBoard((data.data || data)[0]);
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (boardData) => {
    try {
      const { data } = await client.post("/boards", boardData);
      const newBoard = data.data || data;
      setBoards((prev) => [newBoard, ...prev]);
      setActiveBoard(newBoard);
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board");
    }
  };

  const handleUpdateBoard = async (id, updates) => {
    try {
      const { data } = await client.put(`/boards/${id}`, updates);
      const updatedBoard = data.data || data;
      setBoards((prev) => prev.map((b) => (b._id === id ? updatedBoard : b)));
      if (activeBoard?._id === id) {
        setActiveBoard(updatedBoard);
      }
    } catch (error) {
      console.error("Error updating board:", error);
      alert("Failed to update board");
    }
  };

  const handleDeleteBoard = async (id) => {
    try {
      await client.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
      if (activeBoard?._id === id) {
        const remaining = boards.filter((b) => b._id !== id);
        setActiveBoard(remaining[0] || null);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Failed to delete board");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ✅ ADD NAVBAR HERE */}
      <Navbar onAddTaskClick={() => {}} />

      <div className="flex h-[calc(100vh-4rem)] bg-slate-950">
        <Sidebar
          boards={boards}
          activeBoard={activeBoard}
          onSelectBoard={setActiveBoard}
          onCreateBoard={handleCreateBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {activeBoard ? (
              <TodoList board={activeBoard} />
            ) : (
              <div className="glass p-12 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No board selected</h3>
                <p className="text-sm text-muted">Create or select a board from the sidebar</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BoardsPage;
