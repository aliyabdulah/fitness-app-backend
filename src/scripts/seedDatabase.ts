import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedTrainers } from "../seeders/trainerSeeder";
import { seedUserWorkouts } from "../seeders/userWorkoutSeeder";

// Load environment variables from .env file
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fitness-app";

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Seed trainers
    console.log("\n=== Seeding Trainers ===");
    await seedTrainers();

    // Seed workouts for your specific user
    console.log("\n=== Seeding User Workouts ===");
    const result = await seedUserWorkouts();
    console.log(`Created workouts for: ${result.user.name} (${result.user.email})`);
    result.workouts.forEach(workout => {
      console.log(`- ${workout.name}: ${workout.exercises} exercises on ${workout.scheduledDate.toDateString()}`);
    });

    console.log("\n=== Database seeding completed successfully! ===");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 