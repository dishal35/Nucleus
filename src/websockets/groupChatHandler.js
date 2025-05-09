import { verifyUserEnrollment, verifyInstructorAccess } from "../utils/authUtils.js";

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

      // Broadcast the message to all users in the course room
      const room = courseRooms.get(courseId);
      if (room) {
        room.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: "chat",
                sender,
                content,
                courseId,
                timestamp: new Date().toISOString(),
              })
            );
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