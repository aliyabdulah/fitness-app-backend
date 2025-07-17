import { Router } from "express";
import {
  getAllTrainers,
  getTrainerById,
  seedAllTrainers,
} from "../controllers/TrainerControllers";

const router = Router();

// GET /api/trainers - List all trainers
router.get("/", getAllTrainers);

// GET /api/trainers/:id - Get trainer by ID
router.get("/:id", getTrainerById);

// POST /api/trainers/seed-all - Seed all Kuwaiti trainers
router.post("/seed-all", seedAllTrainers);

export default router;
