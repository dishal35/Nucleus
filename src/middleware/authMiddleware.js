import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";

// Middleware to authenticate user
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("Authentication token missing", StatusCodes.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.userId } });
    if (!user) {
      throw new AppError("User not found", StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      next(new AppError("Token has expired. Please log in again.", StatusCodes.UNAUTHORIZED));
    } else {
      next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    }
  }
};

// Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  console.log("verifyToken middleware - token received:", token); // Added logging

  if (!token) {
    console.log("verifyToken middleware - no token provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (error) {
    console.error("verifyToken middleware - invalid token error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to block access if user is already verified
export const blockIfVerified = (req, res, next) => {
  if (req.user && req.user.isVerifiedEmail) {
    return next(new AppError("Action not allowed for verified users", StatusCodes.FORBIDDEN));
  }
  next();
};

// Middleware to block access if user is not verified
export const blockIfNotVerified = (req, res, next) => {
  if (req.user && !req.user.isVerifiedEmail) {
    return next(new AppError("Please verify your email to access this resource", StatusCodes.FORBIDDEN));
  }
  next();
};

// Middleware for role-based access control (optional)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", StatusCodes.FORBIDDEN));
    }
    next();
  };
};
