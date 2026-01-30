import express from "express";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard
} from "../controllers/boardController.js";
// import { requireAuth } from "../middleware/authMiddleware.js"; // COMMENT THIS

const router = express.Router();

// Apply auth middleware to all routes
// router.use(requireAuth); // COMMENT THIS FOR NOW

// Board routes
router.get("/", getBoards);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;
