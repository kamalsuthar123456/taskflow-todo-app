import express from "express";
import {
  getTodosByBoard,
  createTodo,
  updateTodo,
  deleteTodo
} from "../controllers/todoController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Apply auth middleware to all routes
router.use(requireAuth);

// Todo routes
router.get("/", getTodosByBoard);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
