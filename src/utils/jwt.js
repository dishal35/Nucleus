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
    expiresIn: "15m", // 15 minutes
  });

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // 7 days
  });

  // Set access token as a cookie
  res.cookie("jwt", accessToken, {
    maxAge: 15 * 60 * 1000, // 15 minutes
    httpOnly: true,
    sameSite: "lax", // Changed from strict to lax for better compatibility
    secure: process.env.NODE_ENV === "production", // Only secure in production
    path: "/" // Ensure cookie is available everywhere
  });

  // Set refresh token as a cookie
  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: "lax", // Changed from strict to lax for better compatibility
    secure: process.env.NODE_ENV === "production", // Only secure in production
    path: "/" // Ensure cookie is available everywhere
  });

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.log("❌ No refresh token in cookies");
      throw new AppError("Refresh token missing", StatusCodes.UNAUTHORIZED);
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (!decoded || !decoded.userId) {
      throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    // Set the new access token cookie
    res.cookie("jwt", newAccessToken, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    // Send success response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken
    });
  } catch (error) {
    console.log("❌ Refresh token error:", error.message);
    
    // Clear both cookies on error
    res.cookie("jwt", "", { maxAge: 0, path: "/" });
    res.cookie("refreshToken", "", { maxAge: 0, path: "/" });
    
    if (error.name === "TokenExpiredError") {
      next(new AppError("Refresh token has expired. Please log in again.", StatusCodes.UNAUTHORIZED));
    } else {
      next(new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED));
    }
  }
};
