import express from "express";
import { refreshAccessToken } from "../utils/jwt.js";
import { generateTokenAndSetCookie } from "../utils/jwt.js"; // Import the function for testing

const router = express.Router();

// Route to refresh access token
router.post("/refresh-token", refreshAccessToken);

// Test route to generate tokens
router.post("/generate-tokens", (req, res) => {
  const userId = req.body.userId; // Assume userId is sent in the request body
  const { accessToken, refreshToken } = generateTokenAndSetCookie(userId, res);
  res.status(200).json({ accessToken, refreshToken });
});

export default router;
