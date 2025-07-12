import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
connectDB();
app.listen(8000, () => console.log("Server running on 8000")); 