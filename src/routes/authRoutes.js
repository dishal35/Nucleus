import express from "express";
import passport from "passport";
import { refreshAccessToken } from "../utils/jwt.js";
import { generateTokenAndSetCookie } from "../utils/jwt.js";

const router = express.Router();

// Route to refresh access token
router.post("/refresh-token", refreshAccessToken);

// Test route to generate tokens
router.post("/generate-tokens", (req, res) => {
  const userId = req.body.userId; // Assume userId is sent in the request body
  const { accessToken, refreshToken } = generateTokenAndSetCookie(userId, res);
  res.status(200).json({ accessToken, refreshToken });
});

// Google OAuth login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful login
    console.log("Successful Login") // Redirect to a dashboard or home page
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.redirect("/");
  });
});

export default router;
