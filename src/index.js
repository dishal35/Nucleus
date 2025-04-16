import express from "express";
import sequelize from "./config/db.js";
import defineAssociations from "./models/associations.js";
import User from "./models/User.js";
import Course from "./models/Course.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import otpRoutes from "./routes/otpRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
app.use(express.json());
app.use(errorHandler);

const initializeApp = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected successfully.");

    // Define associations
    defineAssociations();

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("✅ Synced successfully.");
  } catch (error) {
    console.error("❌ Initialization error:", error);
  }
};

initializeApp();

app.use("/api/user", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
