import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/jwt.js";
import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import sendVerificationMail from "../utils/sendVerification.js";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      throw new AppError("Full name, email, and password are required", StatusCodes.BAD_REQUEST);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", StatusCodes.BAD_REQUEST);
    }

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("Account with this email already exists", StatusCodes.CONFLICT);
    }

    // Validate password length
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters long", StatusCodes.BAD_REQUEST);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailToken = crypto.randomBytes(64).toString("hex");

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      emailToken,
      role: role || "customer",
    });

    // Send verification email
    sendVerificationMail(email, emailToken);

    // Prepare response data
    const userData = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    };

    // Send response
    sendResponse(res, StatusCodes.CREATED, true, "User created successfully", userData);
  } catch (error) {
    console.error("Signup error:", error);
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const emailToken = req.body.emailToken || req.query.emailToken;

    if (!emailToken) {
      throw new AppError("Email token is required", StatusCodes.BAD_REQUEST);
    }

    // Find user by email token
    const user = await User.findOne({ where: { emailToken } });

    if (!user) {
      throw new AppError("Invalid or expired email token", StatusCodes.NOT_FOUND);
    }

    if (user.isVerifiedEmail) {
      throw new AppError("User is already verified", StatusCodes.BAD_REQUEST);
    }

    // Update user verification status
    user.isVerifiedEmail = true;
    user.emailToken = null;
    await user.save();

    // Send success response
    sendResponse(res, StatusCodes.OK, true, "User verified successfully");
  } catch (error) {
    console.error("Email verification error:", error);
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate user credentials (example logic)
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    if (!user.isVerifiedEmail) {
      const emailToken = crypto.randomBytes(64).toString("hex");
      user.emailToken = emailToken;
      await user.save();
      sendVerificationMail(user.email, user.emailToken);
      throw new AppError("Please verify your email before logging in", StatusCodes.UNAUTHORIZED);
    }

    // Generate tokens
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Set tokens as cookies
    res.cookie("jwt", accessToken, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      data: userData
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

import { Op } from 'sequelize';

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword || !confirmPassword) {
      throw new AppError("All fields are required", StatusCodes.BAD_REQUEST);
    }

    if (newPassword !== confirmPassword) {
      throw new AppError("Passwords do not match", StatusCodes.BAD_REQUEST);
    }

    if (newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters long", StatusCodes.BAD_REQUEST);
    }

    // Find OTP record and check expiration
    const otpRecord = await Otp.findOne({
      where: {
        email,
        otp,
        expiresAt: { [Op.gt]: new Date() }, // Ensure OTP hasn't expired
      },
    });

    if (!otpRecord) {
      throw new AppError("Invalid or expired OTP", StatusCodes.BAD_REQUEST);
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await user.update({ password: hashedPassword });

    // Delete used OTP
    await otpRecord.destroy();

    // Send success response
    sendResponse(res, StatusCodes.OK, true, "Password reset successful");
  } catch (error) {
    console.error("Error resetting password:", error);
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const logout = async (req, res) => {
  try {
    // Clearing JWT cookie
    res.cookie("jwt", "", { maxAge: 0 });
    // Sending success response
    sendResponse(res, StatusCodes.OK, true, "Logout successful");
  } catch (error) {
    // Handling errors
    console.log("Error in logout controller", error.message);
    throw new AppError("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId=req.body.id; // Assuming userId is passed in the request body
    console.log("User ID:", userId);
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    // Delete the user
    await user.destroy();

    // Send success response
    sendResponse(res, StatusCodes.OK, true, "Account deleted successfully");
  } catch (error) {
    console.error("Error deleting account:", error);
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
}
