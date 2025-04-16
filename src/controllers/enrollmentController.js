import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Ensure the course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new AppError("Course not found", StatusCodes.NOT_FOUND);
    }

    // Check if the user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId },
    });

    if (existingEnrollment) {
      throw new AppError("You are already enrolled in this course", StatusCodes.BAD_REQUEST);
    }

    // Enroll the user in the course
    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Enrolled in course successfully",
      data: enrollment,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};