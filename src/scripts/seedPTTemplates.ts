import mongoose from "mongoose";
import { seedWorkoutTemplatesForPT } from "../seeders/workoutSeeder";
import User from "../models/User";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function seedPTTemplates() {
  try {
    // Connect to MongoDB using the same connection as your app
    await mongoose.connect(MONGODB_URI!); // Use ! to tell TypeScript it's not undefined
    console.log("Connected to MongoDB");

    // Your PT user ID
    const ptId = "687b1743cc9275cd26f96112";

    // Create workout templates for this PT
    await seedWorkoutTemplatesForPT(ptId);

    console.log("PT workout templates seeding completed!");
  } catch (error) {
    console.error("Error seeding PT templates:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeder
seedPTTemplates(); 