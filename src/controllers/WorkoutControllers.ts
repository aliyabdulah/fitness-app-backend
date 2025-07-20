import { Request, Response } from "express";
import Workout, { IWorkout } from "../models/Workout";
import Exercise from "../models/Exercise";
import WorkoutAssignment from "../models/WorkoutAssignment";
import User from "../models/User";
import mongoose from "mongoose";
import { seedAllWorkouts, seedWorkoutTemplates, seedUserWorkouts } from "../seeders/workoutSeeder";

// ============= SIMPLE WORKOUT MANAGEMENT (Direct User Workouts) =============

// Create a new workout (direct user creation)
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

    console.log('🔍 Backend received date:', date); // Add this line
    console.log('🔍 Backend received userId:', userId); // Add this line

    let query: any = { userId };

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
      
      console.log('🔍 Date filter:', { startDate, endDate }); // Add this line
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const workouts = await Workout.find(query)
      .populate("exercises.exerciseId")
      .sort({ scheduledDate: 1 });

    console.log('📊 Backend found workouts:', workouts.length); // Add this line

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

// ============= PT WORKOUT TEMPLATE MANAGEMENT =============

// Create workout template (PT only)
export const createWorkoutTemplate = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;
    const { name, exercises, description, difficulty, duration, muscleGroups } = req.body;

    // Validate PT exists and is a PT
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
    }

    // Validate required fields
    if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        message: "Name and at least one exercise are required",
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
      name,
      exercises,
      createdBy: ptId,
      userId: ptId, // PT is also the user for templates
      description,
      difficulty: difficulty || "intermediate",
      duration: duration || 45,
      muscleGroups: muscleGroups || [],
      scheduledDate: new Date(), // Default to today for templates
      status: "scheduled"
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

// Get all workout templates created by PT
export const getPTWorkouts = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
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

// Update workout template (PT only)
export const updateWorkoutTemplate = async (req: Request, res: Response) => {
  try {
    const { ptId, workoutId } = req.params;
    const { name, exercises, description, difficulty, duration, muscleGroups } = req.body;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
    }

    // Find workout and verify ownership
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    if (workout.createdBy?.toString() !== ptId) {
      return res.status(403).json({ message: "You can only edit your own workouts" });
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
      { name, exercises, description, difficulty, duration, muscleGroups },
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

// Delete workout template (PT only)
export const deleteWorkoutTemplate = async (req: Request, res: Response) => {
  try {
    const { ptId, workoutId } = req.params;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
    }

    // Find workout and verify ownership
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    if (workout.createdBy?.toString() !== ptId) {
      return res.status(403).json({ message: "You can only delete your own workouts" });
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

// Assign workout to trainee (PT only)
export const assignWorkoutToTrainee = async (req: Request, res: Response) => {
  try {
    const { ptId, workoutId } = req.params;
    const { traineeId, dueDate, ptNotes } = req.body;

    // Validate PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }
    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
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
      return res.status(403).json({ message: "Trainee is not supervised by this PT" });
    }

    // Validate workout exists and is owned by PT
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    if (workout.createdBy?.toString() !== ptId) {
      return res.status(403).json({ message: "You can only assign your own workouts" });
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
        select: "name exercises difficulty duration",
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

// Get workouts assigned to trainee
export const getTraineeWorkouts = async (req: Request, res: Response) => {
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
    if (status && ["assigned", "in_progress", "completed", "skipped"].includes(status as string)) {
      query.status = status;
    }

    const assignments = await WorkoutAssignment.find(query)
      .populate([
        {
          path: "workout",
          select: "name exercises difficulty duration description",
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
    res.status(500).json({ message: "Failed to retrieve assigned workouts", error });
  }
};

// Add this new function to fetch assigned workouts for trainees
export const getAssignedWorkouts = async (req: Request, res: Response) => {
  try {
    const { traineeId } = req.params;
    const { date } = req.query;

    console.log('=== GET ASSIGNED WORKOUTS DEBUG ===');
    console.log('Trainee ID:', traineeId);
    console.log('Date filter:', date);

    let query: any = { assignedTo: traineeId };

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.assignedDate = { $gte: startDate, $lt: endDate };
    }

    // Get workout assignments and populate the workout template
    const assignments = await WorkoutAssignment.find(query)
      .populate('workout') // Use simple populate without specifying model
      .populate('assignedBy', 'firstName lastName')
      .sort({ assignedDate: 1 });

    console.log('Found assignments:', assignments.length);
    console.log('Sample assignment:', JSON.stringify(assignments[0], null, 2));

    // Transform assignments into workout format
    const workouts = assignments.map(assignment => {
      // Check if workout is populated and has the expected structure
      if (!assignment.workout || typeof assignment.workout === 'string') {
        console.log('Workout not populated properly:', assignment.workout);
        return null;
      }

      // Type assertion to help TypeScript understand the structure
      const workoutTemplate = assignment.workout as any;

      return {
        _id: assignment._id,
        name: workoutTemplate.title,
        description: workoutTemplate.description,
        duration: workoutTemplate.estimatedDuration,
        difficulty: workoutTemplate.difficulty,
        muscleGroups: ['Full Body'], // Default for now
        exercises: workoutTemplate.exercises,
        scheduledDate: assignment.assignedDate,
        status: assignment.status,
        trainerId: assignment.assignedBy,
        isAssigned: true
      };
    }).filter(Boolean); // Remove null entries

    console.log('Transformed workouts:', workouts.length);

    res.status(200).json(workouts);
  } catch (error) {
    console.error('Error fetching assigned workouts:', error);
    res.status(500).json({ message: "Error fetching assigned workouts" });
  }
};

// ============= EXERCISE COMPLETION & PROGRESS TRACKING =============

// Mark exercise as completed
export const markExerciseCompleted = async (req: Request, res: Response) => {
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
      return res.status(403).json({ message: "This workout is not assigned to you" });
    }

    // Validate exercise index
    const exIndex = parseInt(exerciseIndex);
    if (isNaN(exIndex) || exIndex < 0 || exIndex >= assignment.progress.length) {
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
        select: "name exercises difficulty duration",
      },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    res.status(200).json({
      message: "Exercise progress updated successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update exercise progress", error });
  }
};

// Update workout assignment
export const updateWorkoutAssignment = async (req: Request, res: Response) => {
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
      return res.status(403).json({ message: "This workout is not assigned to you" });
    }

    // Update allowed fields
    if (status && ["assigned", "in_progress", "completed", "skipped"].includes(status)) {
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
        select: "name exercises difficulty duration",
      },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    // Calculate completion percentage
    const completedExercises = assignment.progress.filter((p) => p.completed).length;
    const totalExercises = assignment.progress.length;
    const completionPercentage = Math.round((completedExercises / totalExercises) * 100);

    res.status(200).json({
      message: "Workout assignment updated successfully",
      assignment,
      completionStats: {
        completed: completedExercises,
        total: totalExercises,
        percentage: completionPercentage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update workout assignment", error });
  }
};

// Get workout assignment details
export const getWorkoutAssignmentDetails = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await WorkoutAssignment.findById(assignmentId).populate([
      {
        path: "workout",
        select: "name exercises difficulty duration description",
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
    res.status(500).json({ message: "Failed to retrieve workout assignment", error });
  }
};

// POST /api/workouts/seed-templates - Seed workout templates
export const seedWorkoutTemplatesController = async (req: Request, res: Response) => {
  try {
    const templates = await seedWorkoutTemplates();
    
    res.status(201).json({
      message: "Workout templates seeded successfully",
      count: templates.length,
      templates: templates.map(template => ({
        id: template._id,
        name: template.name,
        exercises: template.exercises.length
      }))
    });
  } catch (error) {
    console.error("Error seeding workout templates:", error);
    res.status(500).json({ 
      message: "Failed to seed workout templates", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// POST /api/workouts/seed-user-workouts - Seed user workouts
export const seedUserWorkoutsController = async (req: Request, res: Response) => {
  try {
    const workouts = await seedUserWorkouts();
    
    res.status(201).json({
      message: "User workouts seeded successfully",
      count: workouts.length,
      workouts: workouts.map(workout => ({
        id: workout._id,
        name: workout.name,
        userId: workout.userId,
        exercises: workout.exercises.length
      }))
    });
  } catch (error) {
    console.error("Error seeding user workouts:", error);
    res.status(500).json({ 
      message: "Failed to seed user workouts", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// POST /api/workouts/seed-all - Seed all workout data
export const seedAllWorkoutsController = async (req: Request, res: Response) => {
  try {
    await seedAllWorkouts();
    
    res.status(201).json({
      message: "All workout data seeded successfully"
    });
  } catch (error) {
    console.error("Error seeding all workout data:", error);
    res.status(500).json({ 
      message: "Failed to seed workout data", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}; 

// GET /api/workouts/debug-user - Debug endpoint to check user workouts
export const debugUserWorkouts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "userId query parameter required" });
    }

    console.log(`Debug: Looking for workouts for user: ${userId}`);

    const workouts = await Workout.find({ userId })
      .populate('exercises.exerciseId')
      .sort({ scheduledDate: 1 });

    console.log(`Debug: Found ${workouts.length} workouts`);

    res.status(200).json({
      message: "User workouts retrieved",
      count: workouts.length,
      userId: userId,
      workouts: workouts.map(w => ({
        id: w._id,
        name: w.name,
        scheduledDate: w.scheduledDate,
        status: w.status,
        exercises: w.exercises.map(e => ({
          id: e.exerciseId._id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          state: e.state
        }))
      }))
    });
  } catch (error) {
    console.error("Error debugging user workouts:", error);
    res.status(500).json({ 
      message: "Failed to retrieve user workouts", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}; 