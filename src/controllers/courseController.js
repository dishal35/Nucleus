import Course from "../models/Course.js";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import { setCache, getCache, invalidateCache } from "../utils/redisCache.js";
import redisClient from "../utils/redis.js";
import { Op } from "sequelize";
import Review from "../models/Review.js";
import sequelize from "sequelize";

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

    // Invalidate the homepage courses cache
    await invalidateCache("courses:homepage");

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
    const cacheKey = "courses:homepage";

    // Check cache
    const cachedCourses = await getCache(cacheKey);
    if (cachedCourses) {
      return res.status(StatusCodes.OK).json({ success: true, data: cachedCourses });
    }

    // Fetch from database
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
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "No courses available",
        data: [],
      });
    }

    // Cache the result for 5 minutes
    await setCache(cacheKey, courses, 300);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getCourseById = async (req, res, next) => {
  try{
    const {id} = req.params;
    const userId = req.user.id;

    // Find the course with instructor details
    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['fullName'],
        },
      ],
    });

    if(!course){
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId: id }
    });

    // Add enrollment status to course data
    const courseData = course.toJSON();
    courseData.isEnrolled = !!enrollment;

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: courseData
    });
  }
  catch(error){
    next(new AppError(error.message || "Internal Server Error", 500));
  }
}

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

    // Invalidate the homepage courses cache
    await invalidateCache("courses:homepage");

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
    const { id } = req.body;

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

    // Invalidate the homepage courses cache
    await invalidateCache("courses:homepage");

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `enrolled:user:${userId}`;

    await invalidateCache(cacheKey);
    const cachedCourses = await getCache(cacheKey);
    if (cachedCourses) {
      return res.json(cachedCourses);
    }

    // Find all enrollments for the user
    const enrollments = await Enrollment.findAll({
      where: { userId },
      attributes: ['courseId'],
    });
    const courseIds = enrollments.map(e => e.courseId);

    // Fetch full course objects for these IDs
    const enrolledCourses = await Course.findAll({
      where: { id: courseIds },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['fullName'],
        },
      ],
    });

    await setCache(cacheKey, enrolledCourses, 600);

    res.status(200).json({
      success: true,
      message: 'Enrolled courses retrieved successfully.',
      data: enrolledCourses,
    });
  } catch (error) {
    next(new AppError(error.message || 'Internal Server Error', 500));
  }
};

export const searchCourses = async (req, res, next) => {
  try{
    const query=req.query.query
    if(!query){
      return res.status(400).json({
        success:false,
        message:"Query parameter is required"
      })
    }
    const cacheKey=`search:query:${query}`
    const cachedCourses=await getCache(cacheKey)
    if(cachedCourses){
      return res.status(200).json({
        success:true,
        message:"Courses retrieved from cache",
        data:cachedCourses
      })
    }
    const courses=await Course.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } }, // Search in course title
          { description: { [Op.like]: `%${query}%` } }, // Search in course description
        ],
      },
    });
    if(!courses || courses.length===0){
      return res.status(404).json({
        success:true,
        message:"No courses found",
        data:[]
      })
    }
    await setCache(cacheKey,courses,600)
    res.status(200).json({
      success:true,
      message:"Courses retrieved successfully",
      data:courses
    })
  }
  catch(error){
    next(new AppError(error.message || "Internal Server Error",500))
  }
  }

export const getInstructorDashboard = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const cacheKey = `instructor:dashboard:${instructorId}`;

    // Try to get from cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.status(StatusCodes.OK).json({
        success: true,
        data: cachedData
      });
    }

    // Get all courses by the instructor
    const courses = await Course.findAll({
      where: { instructorId },
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating']
        }
      ]
    });

    // Calculate statistics
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => sum + course.students.length, 0);
    
    // Calculate average rating across all courses
    const allRatings = courses.flatMap(course => 
      course.reviews.map(review => review.rating)
    ).filter(rating => rating != null);
    
    const averageRating = allRatings.length > 0
      ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
      : 0;

    // Get recent reviews
    const recentReviews = await Review.findAll({
      where: {
        courseId: courses.map(course => course.id)
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['fullName']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Calculate enrollment trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrends = await Enrollment.findAll({
      where: {
        courseId: courses.map(course => course.id),
        createdAt: {
          [Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
    });

    const dashboardData = {
      totalCourses,
      totalStudents,
      averageRating,
      recentReviews,
      enrollmentTrends,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        studentCount: course.students.length,
        reviewCount: course.reviews.length,
        averageRating: course.reviews.length > 0
          ? (course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length).toFixed(1)
          : 0
      }))
    };

    // Cache the dashboard data for 5 minutes
    await setCache(cacheKey, dashboardData, 300);

    res.status(StatusCodes.OK).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};