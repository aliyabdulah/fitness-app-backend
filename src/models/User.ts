import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  weight: number;
  height: number;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  fitnessGoal: "lose_weight" | "build_muscle" | "stay_fit" | "endurance" | "flexibility";
  workoutFrequency: number;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  fitnessLevel: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"], 
    required: true 
  },
  fitnessGoal: { 
    type: String, 
    enum: ["lose_weight", "build_muscle", "stay_fit", "endurance", "flexibility"], 
    required: true 
  },
  workoutFrequency: { type: Number, required: true },
  profilePicture: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IUser>("User", UserSchema); 