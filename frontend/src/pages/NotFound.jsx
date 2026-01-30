import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="glass px-10 py-12 text-center max-w-md w-full">
        <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🤔</span>
        </div>
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page not found</h2>
        <p className="text-muted text-sm mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-lg bg-primary hover:bg-indigo-500 text-sm font-medium transition-all"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
