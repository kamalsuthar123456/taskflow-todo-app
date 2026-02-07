import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import BoardsPage from "./pages/BoardsPage";
import EmailVerification from "./pages/EmailVerification";
import NotFound from "./pages/NotFound";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ Helper function to check if user can access protected routes
  const canAccessApp = () => {
    return user && user.emailVerified;
  };

  return (
    <div className="min-h-screen bg-slate-950">
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
        {/* ✅ Auth page - only accessible when not logged in */}
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/" replace />} 
        />
        
        {/* ✅ Email verification page - only for logged in but unverified users */}
        <Route 
          path="/verify-email" 
          element={
            user && !user.emailVerified 
              ? <EmailVerification /> 
              : user 
                ? <Navigate to="/" replace /> 
                : <Navigate to="/auth" replace />
          } 
        />
        
        {/* ✅ Protected routes - only for verified users */}
        <Route 
          path="/" 
          element={
            canAccessApp() 
              ? <Dashboard /> 
              : user 
                ? <Navigate to="/verify-email" replace /> 
                : <Navigate to="/auth" replace />
          } 
        />
        
        <Route 
          path="/boards" 
          element={
            canAccessApp() 
              ? <BoardsPage /> 
              : user 
                ? <Navigate to="/verify-email" replace /> 
                : <Navigate to="/auth" replace />
          } 
        />
        
        {/* 404 page */}
        <Route 
          path="*" 
          element={<NotFound />} 
        />
      </Routes>
    </div>
  );
}

export default App;
