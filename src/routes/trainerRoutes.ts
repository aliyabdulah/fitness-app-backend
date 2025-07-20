import { Router } from "express";
import {
  getAllTrainers,
  getTrainerById,
  seedAllTrainers,
  submitTraineeRequest,
  getTraineesWithStatus,
  debugPTRequests,
  approveTraineeRequest,
  rejectTraineeRequest,
  assignWorkoutToTrainee,
  getWorkoutTemplates,
} from "../controllers/TrainerControllers";

const router = Router();

// GET /api/trainers - List all trainers
router.get("/", getAllTrainers);

// GET /api/trainers/:id - Get trainer by ID
router.get("/:id", getTrainerById);

// POST /api/trainers/seed-all - Seed all Kuwaiti trainers
router.post("/seed-all", seedAllTrainers);

// POST /api/trainers/submit-request - Submit training request
router.post("/submit-request", submitTraineeRequest);

// GET /api/trainers/pt/:ptId/trainees-with-status - Get trainees with status
router.get("/pt/:ptId/trainees-with-status", getTraineesWithStatus);

// Debug endpoint
router.get("/pt/:ptId/debug-requests", debugPTRequests);

// POST /api/trainers/pt/:ptId/trainees/:requestId/approve - Approve trainee request
router.post("/pt/:ptId/trainees/:requestId/approve", approveTraineeRequest);

// POST /api/trainers/pt/:ptId/trainees/:requestId/reject - Reject trainee request
router.post("/pt/:ptId/trainees/:requestId/reject", rejectTraineeRequest);

// POST /api/trainers/assign-workout - Assign workout to trainee
router.post("/assign-workout", assignWorkoutToTrainee);

// GET /api/trainers/pt/:ptId/workout-templates - Get workout templates
router.get("/pt/:ptId/workout-templates", getWorkoutTemplates);

export default router;
