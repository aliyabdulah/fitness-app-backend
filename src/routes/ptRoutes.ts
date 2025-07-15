import { Router } from "express";
import {
  // Standard CRUD operations for PT users
  getAllPTs,
  getPTById,
  createPT,
  updatePT,
  deletePT,
  // Trainee management functions
  getAllTrainees,
  getTraineeById,
  handleTraineeRequest,
  getPendingRequests,
  removeTrainee,
} from "../controllers/PtControllers";

const router = Router();

// Standard CRUD Routes for PT Users

// GET /api/pt - Get all Personal Trainers
router.get("/", getAllPTs);

// GET /api/pt/:id - Get Personal Trainer by ID
router.get("/:id", getPTById);

// POST /api/pt - Create new Personal Trainer
router.post("/", createPT);

// PUT /api/pt/:id - Update Personal Trainer
router.put("/:id", updatePT);

// DELETE /api/pt/:id - Delete Personal Trainer
router.delete("/:id", deletePT);

// Trainee Management Routes - all routes expect ptId as a parameter

// GET /api/pt/:ptId/trainees - Get all trainees supervised by PT
router.get("/:ptId/trainees", getAllTrainees);

// GET /api/pt/:ptId/trainees/:traineeId - Get specific trainee by ID
router.get("/:ptId/trainees/:traineeId", getTraineeById);

// POST /api/pt/:ptId/trainees/request - Handle trainee request (accept/reject)
// Body: { traineeId: string, action: "accept" | "reject" }
router.post("/:ptId/trainees/request", handleTraineeRequest);

// GET /api/pt/:ptId/pending-requests - Get pending trainee requests
router.get("/:ptId/pending-requests", getPendingRequests);

// DELETE /api/pt/:ptId/trainees/:traineeId - Remove trainee from PT supervision
router.delete("/:ptId/trainees/:traineeId", removeTrainee);

export default router;
