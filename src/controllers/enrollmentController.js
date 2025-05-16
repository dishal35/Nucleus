import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import { sendToQueue } from "../utils/rabbitmq.js"; 
import { invalidateCache } from "../utils/redisCache.js";
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    
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

    // Invalidate relevant caches
    await invalidateCache(`enrolled:user:${userId}`);
    await invalidateCache(`instructor:dashboard:${course.instructorId}`);
    
    const emailData = {
      to: req.user.email,
      subject: "Enrollment Confirmation",
      text: `You have successfully enrolled in the course: ${course.title}`,
    };
    await sendToQueue("emailQueue", emailData); 

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Enrolled in course successfully and email sent",
      data: enrollment,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId=req.user.id

    // Ensure the enrollment exists
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId },
    });

    if (!enrollment) {
      throw new AppError("You are not enrolled in this course", StatusCodes.NOT_FOUND);
    }
    await enrollment.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unenrolled from course successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
}