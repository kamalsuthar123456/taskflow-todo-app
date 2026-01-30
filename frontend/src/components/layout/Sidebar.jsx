import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ boards, activeBoard, onSelectBoard, onCreateBoard, onUpdateBoard, onDeleteBoard }) => {
  const { user, logout } = useAuth();
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    await onCreateBoard({
      title: newBoardTitle.trim(),
      description: newBoardDesc.trim()
    });

    setNewBoardTitle("");
    setNewBoardDesc("");
    setIsCreating(false);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <aside className="w-80 h-screen bg-slate-900 border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">TaskFlow</h1>
            <p className="text-[10px] text-muted">Task Management</p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.email}</p>
            <p className="text-[10px] text-muted">Logged in</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-red-400 transition-colors"
            title="Logout"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Boards Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">My Boards</h2>
          <span className="text-xs text-muted bg-slate-800 px-2 py-1 rounded-full">
            {boards.length}
          </span>
        </div>

        {/* Create Board Toggle */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full p-3 mb-3 rounded-lg border-2 border-dashed border-slate-700 hover:border-primary/50 text-sm text-muted hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        ) : (
          <form onSubmit={handleCreateBoard} className="glass p-3 mb-3 space-y-2">
            <input
              type="text"
              placeholder="Board title"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-xs outline-none focus:border-primary"
              autoFocus
              maxLength={100}
            />
            <textarea
              placeholder="Description (optional)"
              value={newBoardDesc}
              onChange={(e) => setNewBoardDesc(e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-slate-900/70 border border-white/10 px-3 py-2 text-xs outline-none focus:border-primary resize-none"
              maxLength={500}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newBoardTitle.trim()}
                className="flex-1 py-1.5 rounded-lg bg-primary hover:bg-indigo-500 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewBoardTitle("");
                  setNewBoardDesc("");
                }}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Boards List */}
        <div className="space-y-2">
          {boards.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-xs text-muted">No boards yet</p>
              <p className="text-[10px] text-muted mt-1">Create one to get started</p>
            </div>
          ) : (
            boards.map((board) => (
              <BoardItem
                key={board._id}
                board={board}
                isActive={activeBoard?._id === board._id}
                onSelect={() => onSelectBoard(board)}
                onUpdate={onUpdateBoard}
                onDelete={onDeleteBoard}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-[10px] text-muted text-center">
          <p>Built with React + Node + MongoDB</p>
          <p className="mt-1">© 2026 TaskFlow</p>
        </div>
      </div>
    </aside>
  );
};

// Board Item Component
const BoardItem = ({ board, isActive, onSelect, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) {
      setTitle(board.title);
      setIsEditing(false);
      return;
    }

    await onUpdate(board._id, { title: title.trim(), description: board.description });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (confirm(`Delete "${board.title}"? This will also delete all its tasks.`)) {
      await onDelete(board._id);
    }
  };

  return (
    <div
      className={`group relative rounded-lg p-3 cursor-pointer transition-all ${
        isActive
          ? "bg-primary/20 border border-primary/30"
          : "bg-slate-800/30 hover:bg-slate-800/50 border border-transparent"
      }`}
      onClick={!isEditing ? onSelect : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate();
              if (e.key === "Escape") {
                setTitle(board.title);
                setIsEditing(false);
              }
            }}
            className="flex-1 bg-slate-900 border border-primary rounded px-2 py-1 text-xs outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate mb-1">{board.title}</h3>
            {board.description && (
              <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                {board.description}
              </p>
            )}
          </div>
        )}

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-slate-700 flex items-center gap-2"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-slate-700 text-red-400 flex items-center gap-2"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r"></div>
      )}
    </div>
  );
};

export default Sidebar;
