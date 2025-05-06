import express from "express";
import { body } from "express-validator";
import {
  signup,
  login,
  logout,
  verifyEmail,
  resetPassword,
  deleteAccount,
} from "../controllers/userController.js";
import { sendOTP } from "../controllers/otpController.js";
import {
  authenticateUser,
  blockIfVerified,
  blockIfNotVerified,
  verifyToken,
} from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import rateLimiter from "../middleware/rateLimiter.js";
import User from "../models/User.js";

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
    body("fullName").notEmpty().withMessage("Full name is required"),
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
router.post("/verify-email", verifyEmail); // Change from GET to POST

// Forgot and reset password
router.post("/forgot-pass", rateLimiter, sendOTP); // Apply rate limiting to OTP requests
router.post("/reset-pass", resetPassword); // Open to all
router.post("/delete-account", deleteAccount); // Only authenticated users can delete their account

// Get current user details
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] }, // Exclude sensitive fields
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
