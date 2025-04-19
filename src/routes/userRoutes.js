import express from "express";
import { body } from "express-validator";
import {
  signup,
  login,
  logout,
  verifyEmail,
  resetPassword,
} from "../controllers/userController.js";
import { sendOTP } from "../controllers/otpController.js";
import {
  authenticateUser,
  blockIfVerified,
  blockIfNotVerified,
} from "../middleware/authMiddleware.js";
import validate  from "../middleware/validate.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes
router.post(
  "/signup",
  rateLimiter,
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  validate,
  signup
);

router.post(
  "/login",
  rateLimiter,
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  blockIfNotVerified,
  login
);

// Protected routes
router.post("/logout", authenticateUser, logout); // Only authenticated users can log out
router.patch("/verify-email", verifyEmail); // For API calls
router.get("/verify-email", verifyEmail); // For email link clicks

// Forgot and reset password
router.post("/forgot-pass", rateLimiter, sendOTP); // Apply rate limiting to OTP requests
router.post("/reset-pass", resetPassword); // Open to all

export default router;
