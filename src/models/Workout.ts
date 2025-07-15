import mongoose, { Document, Schema } from "mongoose";

export interface IExercise {
  name: string; // "Bench Press"
  sets: number; // 4
  reps: string; // "8-12", "to failure", etc. (string to handle ranges)
  notes?: string; // Optional exercise notes
}

export interface IWorkout extends Document {
  title: string; // "Upper Body Strength"
  exercises: IExercise[]; // Flexible number of exercises
  createdBy: mongoose.Types.ObjectId; // PT who created this workout template
  description?: string; // Optional workout description
  difficulty?: "beginner" | "intermediate" | "advanced"; // Optional difficulty level
  estimatedDuration?: number; // Optional duration in minutes
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: String, required: true }, // String to handle "8-12", "to failure", etc.
    notes: { type: String }, // Optional
  },
  { _id: false }
); // Disable _id for subdocuments

const WorkoutSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    exercises: [ExerciseSchema], // Array of exercises
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // PT who created it
    description: { type: String, trim: true }, // Optional description
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    }, // Optional difficulty
    estimatedDuration: { type: Number, min: 1 }, // Optional duration in minutes
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure at least one exercise
WorkoutSchema.pre("save", function (this: IWorkout, next) {
  if (this.exercises.length === 0) {
    const error = new Error("Workout must contain at least one exercise");
    return next(error);
  }
  next();
});

export default mongoose.model<IWorkout>("Workout", WorkoutSchema);
