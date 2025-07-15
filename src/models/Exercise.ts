import mongoose, { Document, Schema } from "mongoose";

// Interface for exercise templates
interface IExercise extends Document {
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  duration?: number; // in seconds
  restTime?: number; // in seconds
  notes?: string;
  muscleGroups: string[];
  equipment?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

// Exercise schema
const ExerciseSchema: Schema = new Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  weight: { type: Number },
  duration: { type: Number },
  restTime: { type: Number },
  notes: { type: String },
  muscleGroups: { type: [String], required: true },
  equipment: { type: String },
  difficulty: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"], 
    required: true 
  },
  instructions: { type: String },
  videoUrl: { type: String },
  imageUrl: { type: String },
}, {
  timestamps: true
});

// Export everything at the end
export { IExercise };
export default mongoose.model<IExercise>("Exercise", ExerciseSchema); 