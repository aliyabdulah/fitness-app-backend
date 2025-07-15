import { Router } from "express";
import {
  getAllTrainers,
  getTrainerById,
  seedTrainer,
} from "../controllers/TrainerControllers";

const router = Router();

// GET /api/trainers - List all trainers
router.get("/", getAllTrainers);

// GET /api/trainers/:id - Get trainer by ID
router.get("/:id", getTrainerById);

// POST /api/trainers/seed - Seed a sample trainer
router.post("/seed", seedTrainer);

export default router;
