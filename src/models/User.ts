import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name: string; // Virtual property that combines firstName and lastName
  age?: number; // Optional field
  weight?: number; // Optional field
  height?: number; // Optional field
  fitnessLevel?: "beginner" | "intermediate" | "advanced"; // Optional field
  fitnessGoal?:
    | "lose_weight"
    | "build_muscle"
    | "stay_fit"
    | "endurance"
    | "flexibility"; // Optional field
  workoutFrequency?: number; // Optional field
  profilePicture?: string;
  role: "trainee" | "pt"; // User role
  trainees?: mongoose.Types.ObjectId[]; // For PTs: array of supervised trainees
  personalTrainer?: mongoose.Types.ObjectId; // For trainees: reference to their PT
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number }, // No longer required
    weight: { type: Number }, // No longer required
    height: { type: Number }, // No longer required
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      // No longer required
    },
    fitnessGoal: {
      type: String,
      enum: [
        "lose_weight",
        "build_muscle",
        "stay_fit",
        "endurance",
        "flexibility",
      ],
      // No longer required
    },
    workoutFrequency: { type: Number }, // No longer required
    profilePicture: { type: String },
    role: {
      type: String,
      enum: ["trainee", "pt"],
      required: true,
    },
    trainees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Array of trainee IDs (only for PTs)
    personalTrainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }, // Reference to PT (only for trainees)
  },
  {
    timestamps: true,
  }
);

// Virtual property for full name
UserSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set("toJSON", {
  virtuals: true,
});

export default mongoose.model<IUser>("User", UserSchema); 