import { Router } from "express";
import {
  // Workout template management
  createWorkout,
  getPTWorkouts,
  updateWorkout,
  deleteWorkout,
  // Workout assignment management
  assignWorkoutToTrainee,
  getTraineeWorkouts,
  // Exercise completion and progress tracking
  markExerciseCompleted,
  updateWorkoutAssignment,
  getWorkoutAssignmentDetails,
} from "../controllers/WorkoutControllers";

const router = Router();

// ============= PT WORKOUT TEMPLATE ROUTES =============

// POST /api/pt/:ptId/workouts - Create workout template
router.post("/pt/:ptId/workouts", createWorkout);

// GET /api/pt/:ptId/workouts - Get all workout templates created by PT
router.get("/pt/:ptId/workouts", getPTWorkouts);

// PUT /api/pt/:ptId/workouts/:workoutId - Update workout template
router.put("/pt/:ptId/workouts/:workoutId", updateWorkout);

// DELETE /api/pt/:ptId/workouts/:workoutId - Delete workout template
router.delete("/pt/:ptId/workouts/:workoutId", deleteWorkout);

// ============= WORKOUT ASSIGNMENT ROUTES =============

// POST /api/pt/:ptId/workouts/:workoutId/assign - Assign workout to trainee
// Body: { traineeId, dueDate?, ptNotes? }
router.post("/pt/:ptId/workouts/:workoutId/assign", assignWorkoutToTrainee);

// GET /api/trainees/:traineeId/workouts - Get workouts assigned to trainee
// Query: ?status=assigned|in_progress|completed|skipped (optional filter)
router.get("/trainees/:traineeId/workouts", getTraineeWorkouts);

// GET /api/assignments/:assignmentId - Get specific workout assignment details
router.get("/assignments/:assignmentId", getWorkoutAssignmentDetails);

// ============= EXERCISE COMPLETION ROUTES =============

// PATCH /api/trainees/:traineeId/assignments/:assignmentId/exercises/:exerciseIndex
// Mark specific exercise as completed
// Body: { completed?, actualSets?, actualReps?, notes? }
router.patch(
  "/trainees/:traineeId/assignments/:assignmentId/exercises/:exerciseIndex",
  markExerciseCompleted
);

// PATCH /api/trainees/:traineeId/assignments/:assignmentId - Update workout assignment
// Body: { status?, traineeNotes? }
router.patch(
  "/trainees/:traineeId/assignments/:assignmentId",
  updateWorkoutAssignment
);

export default router;
