import { Router } from "express";
import { 
  createWorkout,
  getUserWorkouts,
  getWorkoutById,
  updateWorkoutExercise,
  updateWorkoutStats,
  deleteWorkout,
  getExercises,
  debugUserWorkouts
} from "../controllers/WorkoutControllers";

const router = Router();

// GET /api/workouts/exercises - Get all exercises (with optional filters)
router.get("/exercises", getExercises);

// GET /api/workouts/debug-user - Debug endpoint to check user workouts
router.get("/debug-user", debugUserWorkouts);

// GET /api/workouts/user/:userId - Get workouts for a specific user
router.get("/user/:userId", getUserWorkouts);

// GET /api/workouts/:workoutId - Get specific workout by ID
router.get("/:workoutId", getWorkoutById);

// POST /api/workouts - Create new workout
router.post("/", createWorkout);

// PATCH /api/workouts/:workoutId/exercise - Update exercise state in workout
router.patch("/:workoutId/exercise", updateWorkoutExercise);

// PATCH /api/workouts/:workoutId/stats - Update workout statistics
router.patch("/:workoutId/stats", updateWorkoutStats);

// DELETE /api/workouts/:workoutId - Delete workout
router.delete("/:workoutId", deleteWorkout);

export default router; 