import redis from "../utils/redis.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export const getUnreadCount = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const unreadKey = `unread:${courseId}:${userId}`;
    const count = await redis.get(unreadKey) || 0;

    res.status(StatusCodes.OK).json({
      success: true,
      data: { unreadCount: parseInt(count) }
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const resetUnreadCount = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const unreadKey = `unread:${courseId}:${userId}`;
    await redis.del(unreadKey);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unread count reset successfully"
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
}; 