import jwt from "jsonwebtoken";
import { verifyUserEnrollment, verifyInstructorAccess } from "../utils/authUtils.js";
import { handleGroupChatMessage } from "./groupChatHandler.js";

const courseRooms = new Map(); // Map to store course rooms and their WebSocket connections

export const setupWebSocketServer = (wss) => {
  wss.on("connection", async (ws, req) => {
    console.log("🔗 New WebSocket connection");

    // Extract token and courseId from query parameters
    const params = new URLSearchParams(req.url.split("?")[1]);
    const token = params.get("token");
    const courseId = params.get("courseId");

    if (!token || !courseId) {
      ws.close();
      console.log("❌ Connection closed: Missing token or courseId");
      return;
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Validate user and course
      const isValid = await verifyUserEnrollment(userId, courseId);
      const isInstructor = await verifyInstructorAccess(userId, courseId);
      if (!isValid && !isInstructor) {
        ws.close();
        console.log(`❌ Connection closed: User ${userId} is not allowed to chat in course ${courseId}`);
        return;
      }

      // Add the WebSocket connection to the course room
      if (!courseRooms.has(courseId)) {
        courseRooms.set(courseId, new Set());
      }
      courseRooms.get(courseId).add(ws);
      console.log(`✅ User ${userId} connected to course ${courseId}`);

      // Handle incoming messages
      ws.on("message", (message) => {
        handleGroupChatMessage(ws, message.toString(), courseId, courseRooms);
      });

      // Handle disconnection
      ws.on("close", () => {
        courseRooms.get(courseId)?.delete(ws);
        console.log(`❌ User ${userId} disconnected from course ${courseId}`);
      });
    } catch (error) {
      ws.close();
      console.log("❌ Connection closed: Invalid token");
    }
  });
};