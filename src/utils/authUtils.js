import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

/**
 * Verify if a user is enrolled in a course
 * @param {string} userId - The ID of the user
 * @param {string} courseId - The ID of the course
 * @returns {boolean} - True if the user is enrolled, false otherwise
 */
export const verifyUserEnrollment = async (userId, courseId) => {
  try {
    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ User ${userId} does not exist`);
      return false;
    }

    // Check if the course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      console.log(`❌ Course ${courseId} does not exist`);
      return false;
    }

    // Check if the user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId },
    });
    if (!enrollment) {
      console.log(`❌ User ${userId} is not enrolled in course ${courseId}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error verifying user enrollment:", error);
    return false;
  }
};