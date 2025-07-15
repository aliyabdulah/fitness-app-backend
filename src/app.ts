import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import trainerRoutes from "./routes/trainerRoutes";
import workoutRoutes from "./routes/workoutRoutes";

const app = express();

// Configure multer for handling multipart/form-data
const upload = multer({ dest: "uploads/" }); // Files will be stored in uploads/ directory

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());
app.use(morgan("combined"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/workouts", workoutRoutes);


// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "TrainX Backend API is running!" });
});

export default app;
