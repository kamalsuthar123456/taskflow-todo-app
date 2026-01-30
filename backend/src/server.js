import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import boardRoutes from "./routes/boardRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// CORS - MUST BE FIRST
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow API",
    version: "1.0.0"
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/boards/:boardId/todos", todoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? "Internal server error" 
      : err.message
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000;
let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log('🚀 Server running on http://localhost:' + PORT);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server');
    process.exit(1);
  });

export default app;
