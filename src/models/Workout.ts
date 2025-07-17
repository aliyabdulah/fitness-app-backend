import mongoose, { Document, Schema } from "mongoose";

// Interface for individual exercises within a workout
interface IWorkoutExercise {
  exerciseId: mongoose.Types.ObjectId;
  name: string;
  sets: number;
  reps: string;
  state: "pending" | "current" | "completed";
  completedSets?: number;
  notes?: string;
}

// Main workout interface
interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  duration: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  muscleGroups: string[];
  exercises: IWorkoutExercise[];
  scheduledDate: Date;
  completedDate?: Date;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  caloriesBurned?: number;
  averageHeartRate?: number;
  notes?: string;
  trainerId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId; // For PT workout templates
}

// Schema for exercises within a workout
const WorkoutExerciseSchema = new Schema<IWorkoutExercise>({
  exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
  name: { type: String, required: true },
  reps: { type: String, required: true },
  sets: { type: Number, required: true },
  state: { 
    type: String, 
    enum: ["pending", "current", "completed"], 
    default: "pending" 
  },
  completedSets: { type: Number, default: 0 },
  notes: { type: String },
});

// Main workout schema
const WorkoutSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  difficulty: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"], 
    required: true 
  },
  muscleGroups: { type: [String], required: true },
  exercises: { type: [WorkoutExerciseSchema], required: true },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ["scheduled", "in_progress", "completed", "cancelled"], 
    default: "scheduled" 
  },
  caloriesBurned: { type: Number },
  averageHeartRate: { type: Number },
  notes: { type: String },
  trainerId: { type: Schema.Types.ObjectId, ref: "Trainer" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // For PT workout templates
}, {
  timestamps: true
});

// Export everything at the end
export { IWorkout, IWorkoutExercise };
export default mongoose.model<IWorkout>("Workout", WorkoutSchema); 