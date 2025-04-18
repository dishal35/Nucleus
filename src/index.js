import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import defineAssociations from "./models/associations.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import otpRoutes from "./routes/otpRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { connectRabbitMQ } from "./utils/rabbitmq.js";
import consumeEmailQueue from "./consumers/emailConsumer.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await connectRabbitMQ();
    consumeEmailQueue();
    console.log("✅ RabbitMQ consumer started");
    console.log("✅ Connected successfully.");

    // Define associations
    defineAssociations();

    // Sync models
    await sequelize.sync(); // Changed to avoid deadlocks
    console.log("✅ Synced successfully.");

    app.listen(process.env.PORT || 5000,() => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("❌ Server initialization error:", error);
  }
};

startServer();

app.use("/api/user", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
