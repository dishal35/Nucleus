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
import { WebSocketServer } from "ws";
import { setupWebSocketServer } from "./websockets/webSocketHandler.js";
import session from "express-session";
import passport from "./config/passport.js";
import cors from "cors";

dotenv.config();
//allow cors
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Error handler middleware should be last
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
    await sequelize.sync();
    console.log("✅ Synced successfully.");

    const server = app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });

    // WebSocket Server
    const wss = new WebSocketServer({ server });
    setupWebSocketServer(wss); // Delegate WebSocket setup to the handler
    console.log("✅ WebSocket server started");
  } catch (error) {
    console.error("❌ Server initialization error:", error);
  }
};

startServer();
