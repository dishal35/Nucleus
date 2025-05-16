import { verifyUserEnrollment, verifyInstructorAccess } from "../utils/authUtils.js";
import redis from "../utils/redis.js";

export const handleGroupChatMessage = async (ws, message, courseId, courseRooms) => {
  try {
    const parsedMessage = JSON.parse(message);

    // Example message structure: { type: "chat", sender: "userId", content: "Hello, everyone!" }
    if (parsedMessage.type === "chat") {
      const { sender, content } = parsedMessage;

      // Verify if the sender is enrolled in the course
      const isValid = await verifyUserEnrollment(sender, courseId);
      const isInstructor = await verifyInstructorAccess(sender, courseId);
      if (!isValid && !isInstructor) {
        console.log(`❌ Unauthorized message from ${sender} in course ${courseId}`);
        return;
      }

      console.log(`💬 Chat message in course ${courseId} from ${sender}: ${content}`);

      // Get all enrolled users in the course
      const enrolledUsers = await getEnrolledUsers(courseId);
      
      // Broadcast the message and update unread counts
      const room = courseRooms.get(courseId);
      if (room) {
        const messageData = {
          type: "chat",
          sender,
          content,
          courseId,
          timestamp: new Date().toISOString(),
        };

        // For each enrolled user, increment their unread count if they're not the sender
        for (const userId of enrolledUsers) {
          if (userId !== sender) {
            const unreadKey = `unread:${courseId}:${userId}`;
            await redis.incr(unreadKey);
            // Set TTL for unread count (e.g., 30 days)
            await redis.expire(unreadKey, 30 * 24 * 60 * 60);
          }
        }

        // Broadcast to all connected clients
        room.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(messageData));
          }
        });
        console.log(`📤 Message broadcasted to course ${courseId}`);
      } else {
        console.log(`❌ No active users in course ${courseId}`);
      }
    }
  } catch (error) {
    console.error("❌ Error handling WebSocket message:", error);
  }
};

// Helper function to get all enrolled users in a course
const getEnrolledUsers = async (courseId) => {
  try {
    const enrolledKey = `enrolled:${courseId}`;
    let enrolledUsers = await redis.smembers(enrolledKey);
    
    if (!enrolledUsers || enrolledUsers.length === 0) {
      // If not in cache, fetch from database and cache
      const course = await Course.findByPk(courseId, {
        include: [{
          model: User,
          as: 'students',
          attributes: ['id']
        }]
      });
      
      enrolledUsers = course.students.map(student => student.id);
      
      // Cache the enrolled users
      if (enrolledUsers.length > 0) {
        await redis.sadd(enrolledKey, enrolledUsers);
        await redis.expire(enrolledKey, 24 * 60 * 60); // Cache for 24 hours
      }
    }
    
    return enrolledUsers;
  } catch (error) {
    console.error("❌ Error getting enrolled users:", error);
    return [];
  }
};