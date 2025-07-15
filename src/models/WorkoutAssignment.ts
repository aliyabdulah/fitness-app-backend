import mongoose, { Document, Schema } from "mongoose";

export interface IExerciseProgress {
  exerciseIndex: number; // Index of exercise in workout.exercises array
  completed: boolean; // Whether this exercise is completed
  completedAt?: Date; // When it was completed
  actualSets?: number; // Actual sets completed
  actualReps?: string; // Actual reps completed
  notes?: string; // Trainee notes
}

export interface IWorkoutAssignment extends Document {
  workout: mongoose.Types.ObjectId; // Reference to the workout template
  assignedTo: mongoose.Types.ObjectId; // Trainee this workout is assigned to
  assignedBy: mongoose.Types.ObjectId; // PT who assigned it
  assignedDate: Date; // When it was assigned
  dueDate?: Date; // Optional due date
  status: "assigned" | "in_progress" | "completed" | "skipped"; // Workout status
  progress: IExerciseProgress[]; // Progress on each exercise
  completedAt?: Date; // When entire workout was completed
  traineeNotes?: string; // Overall workout notes from trainee
  ptNotes?: string; // Notes from PT
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseProgressSchema: Schema = new Schema(
  {
    exerciseIndex: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    actualSets: { type: Number, min: 0 },
    actualReps: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutAssignmentSchema: Schema = new Schema(
  {
    workout: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["assigned", "in_progress", "completed", "skipped"],
      default: "assigned",
    },
    progress: [ExerciseProgressSchema],
    completedAt: { type: Date },
    traineeNotes: { type: String },
    ptNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
WorkoutAssignmentSchema.index({ assignedTo: 1, assignedDate: -1 });
WorkoutAssignmentSchema.index({ assignedBy: 1, assignedDate: -1 });

// Auto-update status based on progress
WorkoutAssignmentSchema.methods.updateStatus = function () {
  const totalExercises = this.progress.length;
  const completedExercises = this.progress.filter(
    (p: IExerciseProgress) => p.completed
  ).length;

  if (completedExercises === 0) {
    this.status = "assigned";
  } else if (completedExercises === totalExercises) {
    this.status = "completed";
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.status = "in_progress";
  }
};

export default mongoose.model<IWorkoutAssignment>(
  "WorkoutAssignment",
  WorkoutAssignmentSchema
);
