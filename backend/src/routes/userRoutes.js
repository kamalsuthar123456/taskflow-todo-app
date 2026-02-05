import express from "express";
import { syncUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/sync", syncUser);

console.log("✅ User routes registered");

export default router;
