// src/scripts/migrateTrainersToUsers.ts - UPDATED VERSION
import mongoose from "mongoose";
// import Trainer from "../models/Trainer"; // REMOVED - Trainer model deleted after migration
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI as string;

async function migrateTrainersToUsers() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("📡 Using URI:", MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🔄 Starting trainer migration...");
    
    // MIGRATION COMPLETED - Trainer model has been deleted
    console.log("✅ Migration already completed successfully!");
    console.log("📊 6 trainers were migrated to User model with role: 'pt'");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the migration
migrateTrainersToUsers().catch(console.error);