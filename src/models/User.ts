import mongoose, { Document, Schema } from "mongoose";

// Define the interfaces directly in User model since Trainer model is deleted
export interface IService {
  name: string;
  description: string;
  price: string;
  isPopular?: boolean;
}

export interface IStats {
  clientsCoached: string;
  yearsExperience: number;
  rating: number;
  certifications: number;
}

export interface ITraineeRequest {
  _id?: mongoose.Types.ObjectId; // Add this line
  traineeId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  serviceName: string;
  requestDate: Date;
  responseDate?: Date;
}

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
  personalTrainer?: mongoose.Types.ObjectId; // Primary PT (optional - for backward compatibility)
  personalTrainers?: mongoose.Types.ObjectId[]; // Multiple PTs (new field)
  traineeRequests?: ITraineeRequest[]; // Add this line
  // Trainer-specific fields (only for PTs)
  bio?: string;
  instagram?: string;
  services?: IService[];
  stats?: IStats;
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
    }, // Primary PT (optional)
    personalTrainers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Multiple PTs (optional)
    traineeRequests: [
      {
        traineeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: { 
          type: String, 
          enum: ["pending", "approved", "rejected"], 
          default: "pending" 
        },
        serviceName: { type: String, required: true },
        requestDate: { type: Date, default: Date.now },
        responseDate: { type: Date },
      }
    ],
    // Trainer-specific fields (only for PTs)
    bio: { type: String },
    instagram: { type: String },
    services: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: String, required: true },
        isPopular: { type: Boolean, default: false },
      },
    ],
    stats: {
      clientsCoached: { type: String, default: "0" },
      yearsExperience: { type: Number, default: 0 },
      rating: { type: Number, default: 4.5 },
      certifications: { type: Number, default: 0 },
    },
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