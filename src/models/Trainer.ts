import mongoose, { Document, Schema } from "mongoose";

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

export interface ITrainer extends Document {
  name: string;
  image: string;
  bio: string;
  instagram?: string;
  services: IService[];
  stats: IStats;
}

const ServiceSchema = new Schema<IService>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  isPopular: { type: Boolean, default: false },
});

const StatsSchema = new Schema<IStats>({
  clientsCoached: { type: String, required: true },
  yearsExperience: { type: Number, required: true },
  rating: { type: Number, required: true },
  certifications: { type: Number, required: true },
});

const TrainerSchema = new Schema<ITrainer>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  bio: { type: String, required: true },
  instagram: { type: String },
  services: { type: [ServiceSchema], required: true },
  stats: { type: StatsSchema, required: true },
});

export default mongoose.model<ITrainer>("Trainer", TrainerSchema);
// For CommonJS compatibility
module.exports = mongoose.model("Trainer", TrainerSchema);
