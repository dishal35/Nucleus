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
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId); // Ensure this matches the token payload
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      // Add any other necessary user data
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
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
    console.log("restrictTo middleware - user role:", req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", StatusCodes.FORBIDDEN));
    }
    next();
  };
};
