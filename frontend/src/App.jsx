import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast'; // ✅ ADD THIS
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
      {/* ✅ ADD TOASTER HERE */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
        }}
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            minWidth: '300px',
          },
          success: {
            duration: 2000,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: '1px solid #059669',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 3500,
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: '1px solid #dc2626',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
      
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
