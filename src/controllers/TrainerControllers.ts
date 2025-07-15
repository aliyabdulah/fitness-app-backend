import { Request, Response } from "express";
import Trainer from "../models/Trainer";

// GET /api/trainers - List all trainers
export const getAllTrainers = async (req: Request, res: Response) => {
  try {
    const trainers = await Trainer.find();
    res.status(200).json({ trainers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainers", error });
  }
};

// GET /api/trainers/:id - Get trainer by ID
export const getTrainerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.status(200).json({ trainer });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainer", error });
  }
};

// POST /api/trainers/seed - Seed a sample trainer (for testing only)
export const seedTrainer = async (req: Request, res: Response) => {
  try {
    const trainer = await Trainer.create({
      name: "Ahmed Al-Rashid",
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/934951a78a-db8f578d8c8c9b539d33.png",
      bio: "Certified personal trainer with 8+ years of experience in bodybuilding and strength training. Specializes in muscle building, weight loss, and athletic performance. Fluent in Arabic and English. Passionate about helping clients achieve their fitness goals through personalized training programs.",
      instagram: "https://instagram.com/ahmedalrashid",
      services: [
        {
          name: "One on One Training",
          description: "Personalized training sessions",
          price: "60 KWD / session",
          isPopular: true,
        },
        {
          name: "Supervision",
          description: "Workout supervision & guidance",
          price: "180 KWD / month",
        },
        {
          name: "Health Plan",
          description: "Complete nutrition & workout plan",
          price: "250 KWD / month",
        },
      ],
      stats: {
        clientsCoached: "150+",
        yearsExperience: 8,
        rating: 4.9,
        certifications: 5,
      },
    });
    res.status(201).json({ trainer });
  } catch (error) {
    res.status(500).json({ message: "Failed to seed trainer", error });
  }
};
