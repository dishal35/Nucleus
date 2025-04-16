import express from "express";
import { sendOTP, verifyOTP } from "../controllers/otpController.js";
import { authenticateUser, blockIfNotVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

// Use POST for actions that modify or validate data
router.post("/sendOTP", authenticateUser, blockIfNotVerified, sendOTP); // Only unverified users can request OTP
router.post("/verifyOTP", authenticateUser, verifyOTP); // Allow verified and unverified users to verify OTP

export default router;