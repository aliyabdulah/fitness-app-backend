import { Request, Response } from "express";
import Workout, { IWorkout } from "../models/Workout";
import Exercise from "../models/Exercise";

// Create a new workout
export const createWorkout = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, duration, difficulty, muscleGroups, exercises, scheduledDate, trainerId } = req.body;

    const workout = new Workout({
      userId,
      name,
      description,
      duration,
      difficulty,
      muscleGroups,
      exercises,
      scheduledDate,
      trainerId,
    });

    const savedWorkout = await workout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error("Error creating workout:", error);
    res.status(500).json({ message: "Error creating workout" });
  }
};

// Get workouts for a specific user
export const getUserWorkouts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { date, status } = req.query;

    let query: any = { userId };

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const workouts = await Workout.find(query)
      .populate("exercises.exerciseId")
      .sort({ scheduledDate: 1 });

    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: "Error fetching workouts" });
  }
};

// Get a specific workout by ID
export const getWorkoutById = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const workout = await Workout.findById(workoutId)
      .populate("exercises.exerciseId")
      .populate("trainerId");

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    res.status(500).json({ message: "Error fetching workout" });
  }
};

// Update exercise state in a workout
export const updateWorkoutExercise = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const { exerciseId, state, completedSets, notes } = req.body;

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Find the exercise in the workout
    const exerciseIndex = workout.exercises.findIndex(
      (ex) => ex.exerciseId.toString() === exerciseId
    );

    if (exerciseIndex === -1) {
      return res.status(404).json({ message: "Exercise not found in workout" });
    }

    // Update exercise state
    workout.exercises[exerciseIndex].state = state;
    if (completedSets !== undefined) {
      workout.exercises[exerciseIndex].completedSets = completedSets;
    }
    if (notes !== undefined) {
      workout.exercises[exerciseIndex].notes = notes;
    }

    // Update workout status based on exercise states
    const completedExercises = workout.exercises.filter(ex => ex.state === "completed").length;
    const totalExercises = workout.exercises.length;

    if (completedExercises === totalExercises) {
      workout.status = "completed";
      workout.completedDate = new Date();
    } else if (completedExercises > 0) {
      workout.status = "in_progress";
    }

    const updatedWorkout = await workout.save();
    res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error("Error updating workout exercise:", error);
    res.status(500).json({ message: "Error updating workout exercise" });
  }
};

// Update workout statistics
export const updateWorkoutStats = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const { caloriesBurned, averageHeartRate, notes } = req.body;

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Update workout stats
    if (caloriesBurned !== undefined) {
      workout.caloriesBurned = caloriesBurned;
    }
    if (averageHeartRate !== undefined) {
      workout.averageHeartRate = averageHeartRate;
    }
    if (notes !== undefined) {
      workout.notes = notes;
    }

    const updatedWorkout = await workout.save();
    res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error("Error updating workout stats:", error);
    res.status(500).json({ message: "Error updating workout stats" });
  }
};

// Delete a workout
export const deleteWorkout = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.params;
    const workout = await Workout.findByIdAndDelete(workoutId);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ message: "Error deleting workout" });
  }
};

// Get exercises (exercise library)
export const getExercises = async (req: Request, res: Response) => {
  try {
    const { muscleGroup, difficulty, equipment } = req.query;

    let query: any = {};

    // Apply filters if provided
    if (muscleGroup) {
      query.muscleGroups = { $in: [muscleGroup] };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (equipment) {
      query.equipment = equipment;
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Error fetching exercises" });
  }
}; 