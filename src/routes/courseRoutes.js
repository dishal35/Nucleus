import express from "express";
import { createCourse, getCourses } from "../controllers/courseController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/create", authenticateUser, restrictTo("instructor"), createCourse);
router.get("/get", authenticateUser, getCourses);

export default router;