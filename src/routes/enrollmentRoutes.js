import express from "express";
import { body } from "express-validator";
import { enrollInCourse ,unenrollFromCourse} from "../controllers/enrollmentController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// Only students can enroll in courses
router.post("/enroll", authenticateUser, restrictTo("student"), 
[
    body("courseId").not().isEmpty().withMessage("Course ID is required"),
],
validate,
enrollInCourse);
router.delete("/unenroll/:courseId", authenticateUser, restrictTo("student"), unenrollFromCourse);  

export default router;