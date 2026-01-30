import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import BoardsPage from "./pages/BoardsPage";
import EmailVerification from "./pages/EmailVerification";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/verify-email" 
          element={user && !user.emailVerified ? <EmailVerification /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/boards" 
          element={user ? <BoardsPage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="*" 
          element={<NotFound />} 
        />
      </Routes>
    </div>
  );
}

export default App;
