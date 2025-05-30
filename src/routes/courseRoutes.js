import express from "express";
import { body } from "express-validator";
import { createCourse, getCourses, updateCourse, deleteCourse, getEnrolledCourses,searchCourses,getCourseById, getInstructorDashboard } from "../controllers/courseController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Routes
router.post("/create", authenticateUser, restrictTo("instructor"),
[
    body("title").notEmpty().withMessage("Course title cannot be empty"),
    body("description").notEmpty().withMessage("Course description cannot be empty"),
],
validate,
 createCourse);
router.get("/get", authenticateUser, getCourses);
router.get("/get/:id", authenticateUser, getCourseById);
router.post("/update", authenticateUser, restrictTo("instructor"), updateCourse);
router.delete("/delete/:id", authenticateUser, restrictTo("instructor"), deleteCourse);
router.get("/enrolled", authenticateUser, restrictTo("student"), getEnrolledCourses);
router.get("/search",searchCourses);

// Instructor dashboard
router.get("/dashboard", authenticateUser, restrictTo("instructor"), getInstructorDashboard);

export default router;