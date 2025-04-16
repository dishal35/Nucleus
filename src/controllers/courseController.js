import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

export const createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new AppError("Title and description are required", StatusCodes.BAD_REQUEST);
    }

    // Ensure the user is an instructor
    if (req.user.role !== "instructor") {
      throw new AppError("Only instructors can create courses", StatusCodes.FORBIDDEN);
    }

    const course = await Course.create({
      title,
      description,
      instructorId: req.user.id,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["fullName"], // Fetch only the instructor's full name
        },
      ],
    });

    if (!courses || courses.length === 0) {
      throw new AppError("No courses found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Find the course by ID
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError("Course not found", StatusCodes.NOT_FOUND);
    }

    // Ensure the user is the instructor of the course or an admin
    if (req.user.role !== "admin" && req.user.id !== course.instructorId) {
      throw new AppError("You do not have permission to update this course", StatusCodes.FORBIDDEN);
    }

    // Update the course details
    if (title) course.title = title;
    if (description) course.description = description;

    await course.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the course by ID
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError("Course not found", StatusCodes.NOT_FOUND);
    }

    // Ensure the user is the instructor of the course or an admin
    if (req.user.role !== "admin" && req.user.id !== course.instructorId) {
      throw new AppError("You do not have permission to delete this course", StatusCodes.FORBIDDEN);
    }

    // Delete the course
    await course.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

