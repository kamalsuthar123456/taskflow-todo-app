import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import boardRoutes from "./src/routes/boardRoutes.js";
import todoRoutes from "./src/routes/todoRoutes.js";

dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DEBUG: Log every request
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - User: ${req.headers['x-user-id'] || 'none'}`);
  next();
});

// ============================================
// ROUTES
// ============================================

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow API",
    version: "1.0.0"
  });
});

// ✅ API ROUTES
app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);

// ✅ CRITICAL: Mount todo routes at BOTH paths
app.use("/api/boards/:boardId/todos", todoRoutes); // For CRUD with board context
app.use("/api/todos", todoRoutes); // ✅ NEW: For /streak endpoint

// ============================================
// ERROR HANDLERS
// ============================================

app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    availableRoutes: [
      "GET /health",
      "POST /api/users/sync",
      "GET /api/boards",
      "POST /api/boards",
      "GET /api/boards/:boardId/todos",
      "POST /api/boards/:boardId/todos",
      "PATCH /api/boards/:boardId/todos/:id/toggle",
      "GET /api/todos/streak"
    ]
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
let server;

const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received, shutting down...`);
  if (server) {
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log('\n🚀 ================================');
      console.log(`   TaskFlow API Server`);
      console.log(`   http://localhost:${PORT}`);
      console.log('   ================================\n');
      console.log('📋 Available Routes:');
      console.log('   ✅ GET    /health');
      console.log('   ✅ POST   /api/users/sync');
      console.log('   ✅ GET    /api/boards');
      console.log('   ✅ POST   /api/boards');
      console.log('   ✅ GET    /api/boards/:boardId/todos');
      console.log('   ✅ POST   /api/boards/:boardId/todos');
      console.log('   ✅ PATCH  /api/boards/:boardId/todos/:id/toggle');
      console.log('   ✅ GET    /api/todos/streak\n');
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });

export default app;
