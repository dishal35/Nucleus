import express from "express";
import {
  createReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateUser, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/create", authenticateUser, restrictTo("student"), createReview);
router.get("/:courseId", authenticateUser, getReviewsForCourse);
router.patch("/update/:id", authenticateUser, restrictTo("student"), updateReview);
router.delete("/delete/:id", authenticateUser, restrictTo("student"), deleteReview);

export default router;