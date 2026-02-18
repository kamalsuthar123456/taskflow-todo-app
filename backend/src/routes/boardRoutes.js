import express from "express";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard
} from "../controllers/boardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getBoards);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;
