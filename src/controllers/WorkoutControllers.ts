import { Request, Response } from "express";
import Workout from "../models/Workout";
import WorkoutAssignment from "../models/WorkoutAssignment";
import User from "../models/User";
import mongoose from "mongoose";

// ============= WORKOUT TEMPLATE MANAGEMENT (PT Only) =============

// POST /api/pt/:ptId/workouts - Create workout template
const createWorkout = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;
    const { title, exercises, description, difficulty, estimatedDuration } =
      req.body;

    // Validate PT exists and is a PT
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Validate required fields
    if (
      !title ||
      !exercises ||
      !Array.isArray(exercises) ||
      exercises.length === 0
    ) {
      return res.status(400).json({
        message: "Title and at least one exercise are required",
      });
    }

    // Validate exercises format
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (!exercise.name || !exercise.sets || !exercise.reps) {
        return res.status(400).json({
          message: `Exercise ${i + 1}: name, sets, and reps are required`,
        });
      }
      if (typeof exercise.sets !== "number" || exercise.sets < 1) {
        return res.status(400).json({
          message: `Exercise ${i + 1}: sets must be a positive number`,
        });
      }
    }

    const newWorkout = new Workout({
      title,
      exercises,
      createdBy: ptId,
      description,
      difficulty,
      estimatedDuration,
    });

    const savedWorkout = await newWorkout.save();
    await savedWorkout.populate("createdBy", "firstName lastName email");

    res.status(201).json({
      message: "Workout template created successfully",
      workout: savedWorkout,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create workout", error });
  }
};

// GET /api/pt/:ptId/workouts - Get all workout templates created by PT
const getPTWorkouts = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    const workouts = await Workout.find({ createdBy: ptId })
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Workout templates retrieved successfully",
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve workouts", error });
  }
};

// PUT /api/pt/:ptId/workouts/:workoutId - Update workout template
const updateWorkout = async (req: Request, res: Response) => {
  try {
    const { ptId, workoutId } = req.params;
    const { title, exercises, description, difficulty, estimatedDuration } =
      req.body;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Find workout and verify ownership
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    if (workout.createdBy.toString() !== ptId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own workouts" });
    }

    // Validate exercises if provided
    if (exercises) {
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({
          message: "At least one exercise is required",
        });
      }

      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        if (!exercise.name || !exercise.sets || !exercise.reps) {
          return res.status(400).json({
            message: `Exercise ${i + 1}: name, sets, and reps are required`,
          });
        }
      }
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(
      workoutId,
      { title, exercises, description, difficulty, estimatedDuration },
      { new: true, runValidators: true }
    ).populate("createdBy", "firstName lastName email");

    res.status(200).json({
      message: "Workout template updated successfully",
      workout: updatedWorkout,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update workout", error });
  }
};

// DELETE /api/pt/:ptId/workouts/:workoutId - Delete workout template
const deleteWorkout = async (req: Request, res: Response) => {
  try {
    const { ptId, workoutId } = req.params;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Find workout and verify ownership
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    if (workout.createdBy.toString() !== ptId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own workouts" });
    }

    // Delete workout and all associated assignments
    await Workout.findByIdAndDelete(workoutId);
    await WorkoutAssignment.deleteMany({ workout: workoutId });

    res.status(200).json({
      message: "Workout template and all assignments deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete workout", error });
  }
};

// ============= WORKOUT ASSIGNMENT MANAGEMENT =============

// POST /api/pt/:ptId/workouts/:workoutId/assign - Assign workout to trainee
const assignWorkoutToTrainee = async (req: Request, res: Response) => {
  try {
    const { ptId, workoutId } = req.params;
    const { traineeId, dueDate, ptNotes } = req.body;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Validate trainee exists and is supervised by this PT
    const trainee = await User.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }
    if (trainee.role !== "trainee") {
      return res.status(400).json({ message: "User is not a trainee" });
    }
    if (!pt.trainees?.some((t) => t.toString() === traineeId)) {
      return res
        .status(403)
        .json({ message: "Trainee is not supervised by this PT" });
    }

    // Validate workout exists and is owned by PT
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    if (workout.createdBy.toString() !== ptId) {
      return res
        .status(403)
        .json({ message: "You can only assign your own workouts" });
    }

    // Create progress array for all exercises
    const progress = workout.exercises.map((_, index) => ({
      exerciseIndex: index,
      completed: false,
    }));

    const assignment = new WorkoutAssignment({
      workout: workoutId,
      assignedTo: traineeId,
      assignedBy: ptId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      progress,
      ptNotes,
    });

    const savedAssignment = await assignment.save();
    await savedAssignment.populate([
      {
        path: "workout",
        select: "title exercises difficulty estimatedDuration",
      },
      { path: "assignedTo", select: "firstName lastName email" },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    res.status(201).json({
      message: "Workout assigned to trainee successfully",
      assignment: savedAssignment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign workout", error });
  }
};

// GET /api/trainees/:traineeId/workouts - Get workouts assigned to trainee
const getTraineeWorkouts = async (req: Request, res: Response) => {
  try {
    const { traineeId } = req.params;
    const { status } = req.query; // Optional filter by status

    // Validate trainee exists
    const trainee = await User.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }
    if (trainee.role !== "trainee") {
      return res.status(403).json({ message: "User is not a trainee" });
    }

    // Build query
    const query: any = { assignedTo: traineeId };
    if (
      status &&
      ["assigned", "in_progress", "completed", "skipped"].includes(
        status as string
      )
    ) {
      query.status = status;
    }

    const assignments = await WorkoutAssignment.find(query)
      .populate([
        {
          path: "workout",
          select: "title exercises difficulty estimatedDuration description",
        },
        { path: "assignedBy", select: "firstName lastName email" },
      ])
      .sort({ assignedDate: -1 });

    res.status(200).json({
      message: "Assigned workouts retrieved successfully",
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve assigned workouts", error });
  }
};

// Export all functions
export {
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
};

// ============= EXERCISE COMPLETION & PROGRESS TRACKING =============

// PATCH /api/trainees/:traineeId/assignments/:assignmentId/exercises/:exerciseIndex - Mark exercise as completed
const markExerciseCompleted = async (req: Request, res: Response) => {
  try {
    const { traineeId, assignmentId, exerciseIndex } = req.params;
    const { completed, actualSets, actualReps, notes } = req.body;

    // Validate trainee
    const trainee = await User.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }
    if (trainee.role !== "trainee") {
      return res.status(403).json({ message: "User is not a trainee" });
    }

    // Find assignment
    const assignment = await WorkoutAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Workout assignment not found" });
    }
    if (assignment.assignedTo.toString() !== traineeId) {
      return res
        .status(403)
        .json({ message: "This workout is not assigned to you" });
    }

    // Validate exercise index
    const exIndex = parseInt(exerciseIndex);
    if (
      isNaN(exIndex) ||
      exIndex < 0 ||
      exIndex >= assignment.progress.length
    ) {
      return res.status(400).json({ message: "Invalid exercise index" });
    }

    // Update exercise progress
    assignment.progress[exIndex] = {
      exerciseIndex: exIndex,
      completed: completed !== undefined ? completed : true,
      completedAt: completed !== false ? new Date() : undefined,
      actualSets,
      actualReps,
      notes,
    };

    // Update overall assignment status
    (assignment as any).updateStatus();

    await assignment.save();
    await assignment.populate([
      {
        path: "workout",
        select: "title exercises difficulty estimatedDuration",
      },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    res.status(200).json({
      message: "Exercise progress updated successfully",
      assignment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update exercise progress", error });
  }
};

// PATCH /api/trainees/:traineeId/assignments/:assignmentId - Update workout assignment
const updateWorkoutAssignment = async (req: Request, res: Response) => {
  try {
    const { traineeId, assignmentId } = req.params;
    const { status, traineeNotes } = req.body;

    // Validate trainee
    const trainee = await User.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }
    if (trainee.role !== "trainee") {
      return res.status(403).json({ message: "User is not a trainee" });
    }

    // Find assignment
    const assignment = await WorkoutAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Workout assignment not found" });
    }
    if (assignment.assignedTo.toString() !== traineeId) {
      return res
        .status(403)
        .json({ message: "This workout is not assigned to you" });
    }

    // Update allowed fields
    if (
      status &&
      ["assigned", "in_progress", "completed", "skipped"].includes(status)
    ) {
      assignment.status = status;
      if (status === "completed" && !assignment.completedAt) {
        assignment.completedAt = new Date();
      }
    }

    if (traineeNotes !== undefined) {
      assignment.traineeNotes = traineeNotes;
    }

    await assignment.save();
    await assignment.populate([
      {
        path: "workout",
        select: "title exercises difficulty estimatedDuration",
      },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    res.status(200).json({
      message: "Workout assignment updated successfully",
      assignment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update workout assignment", error });
  }
};

// GET /api/assignments/:assignmentId - Get workout assignment details
const getWorkoutAssignmentDetails = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await WorkoutAssignment.findById(assignmentId).populate([
      {
        path: "workout",
        select: "title exercises difficulty estimatedDuration description",
      },
      { path: "assignedTo", select: "firstName lastName email" },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    if (!assignment) {
      return res.status(404).json({ message: "Workout assignment not found" });
    }

    res.status(200).json({
      message: "Workout assignment details retrieved successfully",
      assignment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve workout assignment", error });
  }
};
