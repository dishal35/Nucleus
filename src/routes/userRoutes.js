import express from "express";
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

const router = express.Router();

// Public routes
router.post("/signup", signup); // Signup is open to all
router.post("/login", login); // Login is open to all
// Protected routes
router.post("/logout", authenticateUser, logout); // Only authenticated users can log out
router.patch("/verify-email", verifyEmail); // For API calls
router.get("/verify-email", verifyEmail); // For email link clicks

// Forgot and reset password
router.post("/forgot-pass", sendOTP); // Open to all
router.post("/reset-pass", resetPassword); // Open to all

export default router;
