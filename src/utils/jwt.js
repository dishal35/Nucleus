// Import the jsonwebtoken library
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AppError from "./AppError.js"; // Updated import statement
import { StatusCodes } from "http-status-codes";
dotenv.config();

// Define a function that generates access and refresh tokens and sets them as cookies
export const generateTokenAndSetCookie = (userId, res) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m", // Short-lived access token
  });

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // Long-lived refresh token
  });

  // Set access token as a cookie
  res.cookie("jwt", accessToken, {
    maxAge: 15 * 60 * 1000, // 15 minutes
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  // Set refresh token as a cookie
  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      console.log("❌ No refresh token received");
      throw new AppError("Refresh token missing", StatusCodes.UNAUTHORIZED);
    }

    console.log("🔐 Refresh token received:", refreshToken);
    console.log("🔐 Secret used:", process.env.JWT_REFRESH_SECRET);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); // ← Likely fails here

    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    res.cookie("jwt", newAccessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("❌ JWT Error:", error.message); // ← Add this line
    if (error.name === "TokenExpiredError") {
      next(new AppError("Refresh token has expired. Please log in again.", StatusCodes.UNAUTHORIZED));
    } else {
      next(new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED));
    }
  }
};
