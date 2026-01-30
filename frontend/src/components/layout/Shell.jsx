import { useAuth } from "../../context/AuthContext";

const Shell = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="border-b border-white/5 backdrop-blur sticky top-0 z-10 bg-slate-950/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-primary/30 flex items-center justify-center text-primary font-bold">
              T
            </span>
            <span className="font-semibold tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Shell;
