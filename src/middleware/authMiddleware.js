import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";

// Middleware to authenticate user
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    console.log("Token:", token); // Debugging line

    if (!token) {
      throw new AppError("Authentication token missing", StatusCodes.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging line

    const user = await User.findOne({ where: { id: decoded.userId } });
    if (!user) {
      throw new AppError("User not found", StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error); // Debugging line
    if (error.name === "TokenExpiredError") {
      next(new AppError("Token has expired. Please log in again.", StatusCodes.UNAUTHORIZED));
    } else {
      next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    }
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
