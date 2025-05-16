import express from "express";
import { getUnreadCount, resetUnreadCount } from "../controllers/chatController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get unread message count for a course
router.get("/:courseId/unread", authenticateUser, getUnreadCount);

// Reset unread message count for a course
router.post("/:courseId/unread/reset", authenticateUser, resetUnreadCount);

export default router; 