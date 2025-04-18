import express from "express";
import { enrollInCourse ,unenrollFromCourse} from "../controllers/enrollmentController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only students can enroll in courses
router.post("/enroll", authenticateUser, restrictTo("student"), enrollInCourse);
router.delete("/unenroll/:courseId", authenticateUser, restrictTo("student"), unenrollFromCourse);  

export default router;