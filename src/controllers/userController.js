import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/jwt.js";
import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import sendVerificationMail from "../utils/sendVerification.js";
import crypto from "crypto";
import Otp from "../models/Otp.js";

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

    // Validate input
    if (!email || !password) {
      throw new AppError("Email and password are required", StatusCodes.BAD_REQUEST);
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    // Check if the user is verified
    if (!user.isVerifiedEmail) {
      throw new AppError(
        "Your email is not verified. Please verify your email before logging in.",
        StatusCodes.FORBIDDEN
      );
    }

    // Generate JWT token and set it as a cookie
    const token = generateTokenAndSetCookie(user.id, res);

    // Send success response with user data
    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
    sendResponse(res, StatusCodes.OK, true, "Login successful", { ...userData, token });
  } catch (error) {
    console.error("Login error:", error);
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