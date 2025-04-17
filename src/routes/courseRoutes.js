import express from "express";
import { createCourse, getCourses,updateCourse,deleteCourse } from "../controllers/courseController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/create", authenticateUser, restrictTo("instructor"), createCourse);
router.get("/get", authenticateUser, getCourses);
router.post("/update", authenticateUser, restrictTo("instructor"), updateCourse);
router.delete("/delete", authenticateUser, restrictTo("instructor"), deleteCourse);

export default router;