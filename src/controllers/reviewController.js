import Review from "../models/Review.js";
import Enrollment from "../models/Enrollment.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

export const createReview = async (req, res, next) => {
  try {
    const { courseId, title, content } = req.body;

    // Ensure the user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId },
    });

    if (!enrollment) {
      throw new AppError("You must be enrolled in the course to leave a review", StatusCodes.FORBIDDEN);
    }

    // Ensure the user hasn't already left a review for this course
    const existingReview = await Review.findOne({
      where: { authorId: req.user.id, courseId },
    });

    if (existingReview) {
      throw new AppError("You have already left a review for this course", StatusCodes.BAD_REQUEST);
    }

    const review = await Review.create({
      title,
      content,
      authorId: req.user.id,
      courseId,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getReviewsForCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["fullName"],
        },
      ],
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      throw new AppError("Review not found", StatusCodes.NOT_FOUND);
    }

    // Ensure the user is the author of the review
    if (req.user.id !== review.authorId) {
      throw new AppError("You do not have permission to update this review", StatusCodes.FORBIDDEN);
    }

    if (title) review.title = title;
    if (content) review.content = content;

    await review.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      throw new AppError("Review not found", StatusCodes.NOT_FOUND);
    }

    // Ensure the user is the author of the review
    if (req.user.id !== review.authorId) {
      throw new AppError("You do not have permission to delete this review", StatusCodes.FORBIDDEN);
    }

    await review.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};