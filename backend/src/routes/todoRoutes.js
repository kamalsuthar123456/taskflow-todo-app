import express from "express";
import {
  getTodosByBoard,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus
} from "../controllers/todoController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// ✅ ALL routes require authentication
router.use(requireAuth);

router.get("/", getTodosByBoard);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.patch("/:id/toggle", toggleTodoStatus);
router.delete("/:id", deleteTodo);

console.log("✅ Todo routes loaded with authentication");

export default router;
