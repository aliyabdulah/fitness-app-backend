import mongoose from "mongoose";
import Workout from "../models/Workout";
import Exercise from "../models/Exercise";
import User from "../models/User";

// Sample workout templates for different goals
const workoutTemplates = [
  {
    name: "Upper Body Strength",
    description: "Comprehensive upper body workout focusing on chest, back, and shoulders",
    duration: 45,
    difficulty: "intermediate",
    muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-12" },
      { name: "Pull-ups", sets: 3, reps: "8-12" },
      { name: "Shoulder Press", sets: 3, reps: "10-12" },
      { name: "Lat Pulldown", sets: 3, reps: "12-15" },
      { name: "Bicep Curls", sets: 3, reps: "12-15" },
      { name: "Tricep Dips", sets: 3, reps: "10-15" }
    ]
  },
  {
    name: "Lower Body Power",
    description: "Intense lower body workout for strength and muscle building",
    duration: 50,
    difficulty: "intermediate",
    muscleGroups: ["Legs", "Glutes"],
    exercises: [
      { name: "Squats", sets: 4, reps: "8-12" },
      { name: "Leg Press", sets: 4, reps: "12-15" },
      { name: "Leg Extensions", sets: 3, reps: "15-20" },
      { name: "Leg Curls", sets: 3, reps: "12-15" },
      { name: "Plank", sets: 3, duration: 60 }
    ]
  },
  {
    name: "Full Body Circuit",
    description: "Complete body workout combining strength and cardio",
    duration: 40,
    difficulty: "beginner",
    muscleGroups: ["Chest", "Back", "Legs", "Core"],
    exercises: [
      { name: "Bench Press", sets: 3, reps: "10-12" },
      { name: "Lat Pulldown", sets: 3, reps: "12-15" },
      { name: "Squats", sets: 3, reps: "12-15" },
      { name: "Shoulder Press", sets: 3, reps: "10-12" },
      { name: "Crunches", sets: 3, reps: "15-20" },
      { name: "Treadmill Run", sets: 1, duration: 600 }
    ]
  },
  {
    name: "Chest and Triceps",
    description: "Focused workout for chest and tricep development",
    duration: 35,
    difficulty: "intermediate",
    muscleGroups: ["Chest", "Triceps"],
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-12" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-15" },
      { name: "Chest Flyes", sets: 3, reps: "12-15" },
      { name: "Tricep Pushdowns", sets: 3, reps: "12-15" },
      { name: "Tricep Dips", sets: 3, reps: "10-15" }
    ]
  },
  {
    name: "Back and Biceps",
    description: "Comprehensive back and bicep workout",
    duration: 40,
    difficulty: "intermediate",
    muscleGroups: ["Back", "Biceps"],
    exercises: [
      { name: "Pull-ups", sets: 3, reps: "8-12" },
      { name: "Lat Pulldown", sets: 4, reps: "10-12" },
      { name: "Seated Row", sets: 3, reps: "12-15" },
      { name: "Bicep Curls", sets: 3, reps: "12-15" },
      { name: "Lateral Raises", sets: 3, reps: "15-20" }
    ]
  },
  {
    name: "Core and Cardio",
    description: "Core strengthening with cardio boost",
    duration: 30,
    difficulty: "beginner",
    muscleGroups: ["Core", "Cardio"],
    exercises: [
      { name: "Plank", sets: 3, duration: 60 },
      { name: "Crunches", sets: 3, reps: "15-20" },
      { name: "Russian Twists", sets: 3, reps: "20-25" },
      { name: "Stationary Bike", sets: 1, duration: 900 },
      { name: "Rowing Machine", sets: 1, duration: 600 }
    ]
  }
];

// Seeder function to create workout templates
export const seedWorkoutTemplates = async () => {
  try {
    // Get a sample user to assign as createdBy (for PT templates)
    const sampleUser = await User.findOne({ role: "pt" });
    if (!sampleUser) {
      console.log("No PT user found, creating workout templates without createdBy");
    }

    // Clear existing workout templates (where createdBy exists)
    await Workout.deleteMany({ createdBy: { $exists: true } });
    console.log("Cleared existing workout templates");

    const createdTemplates = [];

    for (const template of workoutTemplates) {
      // Get exercise IDs for this template
      const exerciseIds = [];
      for (const exerciseData of template.exercises) {
        const exercise = await Exercise.findOne({ name: exerciseData.name });
        if (exercise) {
          exerciseIds.push({
            exerciseId: exercise._id,
            name: exercise.name,
            sets: exerciseData.sets,
            reps: exerciseData.reps || exercise.reps,
            state: "pending"
          });
        }
      }

      if (exerciseIds.length > 0) {
        const workoutTemplate = new Workout({
          name: template.name,
          description: template.description,
          duration: template.duration,
          difficulty: template.difficulty,
          muscleGroups: template.muscleGroups,
          exercises: exerciseIds,
          createdBy: sampleUser?._id, // For PT templates
          status: "scheduled"
        });

        const savedTemplate = await workoutTemplate.save();
        createdTemplates.push(savedTemplate);
        console.log(`Created template: ${template.name} with ${exerciseIds.length} exercises`);
      }
    }

    console.log(`Successfully created ${createdTemplates.length} workout templates`);
    return createdTemplates;
  } catch (error) {
    console.error("Error seeding workout templates:", error);
    throw error;
  }
};

// Seeder function to create sample workouts for users
export const seedUserWorkouts = async () => {
  try {
    // Get sample users and exercises
    const users = await User.find({ role: "trainee" }).limit(3);
    const exercises = await Exercise.find().limit(10);

    if (users.length === 0) {
      console.log("No trainee users found for workout seeding");
      return [];
    }

    if (exercises.length === 0) {
      console.log("No exercises found for workout seeding");
      return [];
    }

    // Clear existing user workouts
    await Workout.deleteMany({ userId: { $exists: true } });
    console.log("Cleared existing user workouts");

    const createdWorkouts = [];

    for (const user of users) {
      // Create 2-3 workouts for each user
      const numWorkouts = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numWorkouts; i++) {
        const workoutDate = new Date();
        workoutDate.setDate(workoutDate.getDate() + i + 1); // Schedule for next few days

        const workoutExercises = exercises
          .slice(0, Math.floor(Math.random() * 4) + 3) // 3-6 exercises
          .map(exercise => ({
            exerciseId: exercise._id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            state: "pending" as const
          }));

        const workout = new Workout({
          userId: user._id,
          name: `Workout ${i + 1}`,
          description: `Scheduled workout for ${user.firstName}`,
          duration: 45,
          difficulty: "intermediate",
          muscleGroups: ["Chest", "Back", "Legs"],
          exercises: workoutExercises,
          scheduledDate: workoutDate,
          status: "scheduled"
        });

        const savedWorkout = await workout.save();
        createdWorkouts.push(savedWorkout);
        console.log(`Created workout for ${user.firstName}: ${savedWorkout.name}`);
      }
    }

    console.log(`Successfully created ${createdWorkouts.length} user workouts`);
    return createdWorkouts;
  } catch (error) {
    console.error("Error seeding user workouts:", error);
    throw error;
  }
};

// Combined seeder function
export const seedAllWorkouts = async () => {
  try {
    console.log("Starting workout seeding...");
    
    // Seed workout templates first
    await seedWorkoutTemplates();
    
    // Then seed user workouts
    await seedUserWorkouts();
    
    console.log("Workout seeding completed successfully!");
  } catch (error) {
    console.error("Error in workout seeding:", error);
    throw error;
  }
}; 