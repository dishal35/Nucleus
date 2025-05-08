import express from 'express';
import { upload,getPresignedUrl } from '../config/s3.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';
import CourseContent from '../models/CourseContent.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// Upload single file
router.post(
  '/upload/:courseId',
  verifyToken,
  restrictTo('instructor'),
  upload.single('file'), // 'file' must match the field name in your FormData
  async (req, res) => {
    try {
      console.log('Upload request received:', {
        courseId: req.params.courseId,
        user: req.user, // Log the user object
        file: req.file,
        body: req.body
      });

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { courseId } = req.params;
      const { title, description } = req.body;

      // Verify course ownership
      const course = await Course.findOne({
        where: { 
          id: courseId,
          instructorId: req.user.id 
        }
      });

      if (!course) {
        return res.status(403).json({ 
          message: 'You are not authorized to upload content to this course' 
        });
      }

      // Save file information to database
      const content = await CourseContent.create({
        courseId,
        title,
        description,
        fileUrl: req.file.location, // S3 URL
        fileType: req.file.mimetype,
        key: req.file.key
      });

      res.status(200).json({
        message: 'File uploaded successfully',
        data: content
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get course content
router.get(
  '/:courseId',
  verifyToken,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const isEnrolled = await Enrollment.findOne({
        where: {
          courseId,
          userId: req.user.id
        }
      });

      if (!isEnrolled) {
        return res.status(403).json({
          message: 'You are not enrolled in this course'
        });
      } 

      const content = await CourseContent.findAll({
        where: { courseId }
      });

      // Generate presigned URLs for each content item
      const contentWithUrls = await Promise.all(content.map(async (item) => {
        const presignedUrl = await getPresignedUrl(item.key);
        return {
          ...item.toJSON(),
          fileUrl: presignedUrl
        };
      }));

      res.json({ data: contentWithUrls });
    } catch (error) {
      console.error('Error fetching course content:', error);
      res.status(500).json({ message: 'Error fetching course content' });
    }
  }
);

// Delete course content
router.delete(
  '/:courseId/:contentId',
  verifyToken,
  restrictTo('instructor'),
  async (req, res) => {
    try {
      // Implement deletion logic
      // Remember to delete from both S3 and your database
      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting content' });
    }
  }
);

export default router; 

