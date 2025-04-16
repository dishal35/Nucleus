import express from "express";
import { enrollInCourse } from "../controllers/enrollmentController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only students can enroll in courses
router.post("/enroll", authenticateUser, restrictTo("student"), enrollInCourse);

export default router;