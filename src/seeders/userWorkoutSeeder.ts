import mongoose from "mongoose";
import Workout from "../models/Workout";
import Exercise from "../models/Exercise";
import User from "../models/User";

// Sample exercises for your workouts
const sampleExercises = [
  {
    name: "Bench Press",
    sets: 4,
    reps: "8-12",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Bench Press Machine",
    difficulty: "intermediate",
    instructions: "Lie on bench, lower bar to chest, press up with control"
  },
  {
    name: "Pull-ups",
    sets: 3,
    reps: "8-12",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Pull-up Bar",
    difficulty: "advanced",
    instructions: "Hang from bar, pull body up until chin over bar"
  },
  {
    name: "Squats",
    sets: 4,
    reps: "10-12",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Barbell",
    difficulty: "intermediate",
    instructions: "Lower body as if sitting back, keep chest up"
  },
  {
    name: "Shoulder Press",
    sets: 3,
    reps: "10-12",
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Dumbbells",
    difficulty: "intermediate",
    instructions: "Press dumbbells overhead while seated or standing"
  },
  {
    name: "Lat Pulldown",
    sets: 3,
    reps: "12-15",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Lat Pulldown Machine",
    difficulty: "beginner",
    instructions: "Sit at machine, pull bar down to upper chest"
  },
  {
    name: "Bicep Curls",
    sets: 3,
    reps: "12-15",
    muscleGroups: ["Biceps"],
    equipment: "Dumbbells",
    difficulty: "beginner",
    instructions: "Curl dumbbells up while keeping elbows at sides"
  },
  {
    name: "Tricep Dips",
    sets: 3,
    reps: "10-15",
    muscleGroups: ["Triceps", "Chest"],
    equipment: "Dip Bars",
    difficulty: "intermediate",
    instructions: "Lower body between bars, push back up"
  },
  {
    name: "Plank",
    sets: 3,
    reps: "60 seconds",
    duration: 60,
    muscleGroups: ["Core"],
    equipment: "Bodyweight",
    difficulty: "beginner",
    instructions: "Hold body in straight line from head to heels"
  }
];

// Sample workouts for your user
const sampleWorkouts = [
  {
    name: "Upper Body Strength",
    description: "Comprehensive upper body workout for muscle building",
    duration: 45,
    difficulty: "intermediate",
    muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-12" },
      { name: "Pull-ups", sets: 3, reps: "8-12" },
      { name: "Shoulder Press", sets: 3, reps: "10-12" },
      { name: "Bicep Curls", sets: 3, reps: "12-15" },
      { name: "Tricep Dips", sets: 3, reps: "10-15" }
    ]
  },
  {
    name: "Lower Body Power",
    description: "Intense lower body workout for strength",
    duration: 40,
    difficulty: "intermediate",
    muscleGroups: ["Legs", "Glutes"],
    exercises: [
      { name: "Squats", sets: 4, reps: "10-12" },
      { name: "Plank", sets: 3, reps: "60 seconds" }
    ]
  },
  {
    name: "Full Body Circuit",
    description: "Complete body workout for overall fitness",
    duration: 35,
    difficulty: "intermediate",
    muscleGroups: ["Chest", "Back", "Legs", "Core"],
    exercises: [
      { name: "Bench Press", sets: 3, reps: "10-12" },
      { name: "Lat Pulldown", sets: 3, reps: "12-15" },
      { name: "Squats", sets: 3, reps: "12-15" },
      { name: "Plank", sets: 3, reps: "60 seconds" }
    ]
  }
];

// Your specific user ID
const YOUR_USER_ID = "6870e5d175d76ffe5bfb9ed7";

// Seeder function for your specific user
export const seedUserWorkouts = async () => {
  try {
    // Verify user exists
    const user = await User.findById(YOUR_USER_ID);
    if (!user) {
      throw new Error(`User with ID ${YOUR_USER_ID} not found`);
    }

    console.log(`Seeding workouts for user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Clear existing workouts for this user
    await Workout.deleteMany({ userId: YOUR_USER_ID });
    console.log("Cleared existing workouts for user");

    // Get or create exercises (handle duplicates)
    const createdExercises = [];
    for (const exerciseData of sampleExercises) {
      // Try to find existing exercise first
      let exercise = await Exercise.findOne({ name: exerciseData.name });
      
      if (!exercise) {
        // Create new exercise if it doesn't exist
        exercise = new Exercise(exerciseData);
        exercise = await exercise.save();
        console.log(`Created new exercise: ${exerciseData.name}`);
      } else {
        console.log(`Found existing exercise: ${exerciseData.name}`);
      }
      
      createdExercises.push(exercise);
    }
    console.log(`Total exercises available: ${createdExercises.length}`);

    // Create workouts for the user
    const createdWorkouts = [];
    for (let i = 0; i < sampleWorkouts.length; i++) {
      const workoutData = sampleWorkouts[i];
      
      // Schedule workouts for today and next few days (not July 2025)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + i); // Today, tomorrow, day after
      scheduledDate.setHours(10, 0, 0, 0); // 10 AM

      // Map exercise names to exercise IDs
      const workoutExercises = [];
      for (const exerciseData of workoutData.exercises) {
        const exercise = createdExercises.find(ex => ex.name === exerciseData.name);
        if (exercise) {
          workoutExercises.push({
            exerciseId: exercise._id,
            name: exercise.name,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            state: "pending" as const
          });
        }
      }

      const workout = new Workout({
        userId: YOUR_USER_ID,
        name: workoutData.name,
        description: workoutData.description,
        duration: workoutData.duration,
        difficulty: workoutData.difficulty,
        muscleGroups: workoutData.muscleGroups,
        exercises: workoutExercises,
        scheduledDate: scheduledDate,
        status: "scheduled"
      });

      const savedWorkout = await workout.save();
      createdWorkouts.push(savedWorkout);
      
      console.log(`Created workout: ${workoutData.name} for ${scheduledDate.toDateString()}`);
    }

    console.log(`Successfully created ${createdWorkouts.length} workouts for user ${user.firstName}`);
    
    return {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      workouts: createdWorkouts.map(w => ({
        id: w._id,
        name: w.name,
        scheduledDate: w.scheduledDate,
        exercises: w.exercises.length
      }))
    };
  } catch (error) {
    console.error("Error seeding user workouts:", error);
    throw error;
  }
}; 