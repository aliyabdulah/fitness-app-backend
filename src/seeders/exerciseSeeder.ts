import mongoose from "mongoose";
import Exercise from "../models/Exercise";

// Common exercise data with Kuwaiti gym context
const exercises = [
  // Chest Exercises
  {
    name: "Bench Press",
    sets: 4,
    reps: "8-12",
    weight: 60,
    restTime: 120,
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Bench Press Machine",
    difficulty: "intermediate",
    instructions: "Lie on bench, lower bar to chest, press up with control",
    notes: "Focus on form and controlled movement"
  },
  {
    name: "Incline Dumbbell Press",
    sets: 3,
    reps: "10-15",
    weight: 20,
    restTime: 90,
    muscleGroups: ["Chest", "Shoulders"],
    equipment: "Incline Bench",
    difficulty: "intermediate",
    instructions: "Lie on incline bench, press dumbbells up and together",
    notes: "Great for upper chest development"
  },
  {
    name: "Chest Flyes",
    sets: 3,
    reps: "12-15",
    weight: 15,
    restTime: 60,
    muscleGroups: ["Chest"],
    equipment: "Cable Machine",
    difficulty: "beginner",
    instructions: "Stand with cables at chest level, bring hands together in arc motion",
    notes: "Focus on chest squeeze at peak contraction"
  },

  // Back Exercises
  {
    name: "Pull-ups",
    sets: 3,
    reps: "8-12",
    restTime: 120,
    muscleGroups: ["Back", "Biceps"],
    equipment: "Pull-up Bar",
    difficulty: "advanced",
    instructions: "Hang from bar, pull body up until chin over bar",
    notes: "Full range of motion is key"
  },
  {
    name: "Lat Pulldown",
    sets: 4,
    reps: "10-12",
    weight: 50,
    restTime: 90,
    muscleGroups: ["Back", "Biceps"],
    equipment: "Lat Pulldown Machine",
    difficulty: "beginner",
    instructions: "Sit at machine, pull bar down to upper chest",
    notes: "Keep chest up, squeeze shoulder blades"
  },
  {
    name: "Seated Row",
    sets: 3,
    reps: "12-15",
    weight: 40,
    restTime: 90,
    muscleGroups: ["Back", "Biceps"],
    equipment: "Cable Row Machine",
    difficulty: "beginner",
    instructions: "Sit at machine, pull handles to lower chest",
    notes: "Focus on squeezing shoulder blades together"
  },

  // Shoulder Exercises
  {
    name: "Shoulder Press",
    sets: 4,
    reps: "8-12",
    weight: 25,
    restTime: 120,
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Dumbbells",
    difficulty: "intermediate",
    instructions: "Press dumbbells overhead while seated or standing",
    notes: "Keep core tight, avoid arching back"
  },
  {
    name: "Lateral Raises",
    sets: 3,
    reps: "15-20",
    weight: 8,
    restTime: 60,
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbells",
    difficulty: "beginner",
    instructions: "Raise dumbbells to sides until arms parallel to ground",
    notes: "Control the movement, avoid swinging"
  },
  {
    name: "Rear Delt Flyes",
    sets: 3,
    reps: "12-15",
    weight: 5,
    restTime: 60,
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbells",
    difficulty: "beginner",
    instructions: "Bend forward, raise dumbbells to sides",
    notes: "Great for posture and shoulder health"
  },

  // Arm Exercises
  {
    name: "Bicep Curls",
    sets: 3,
    reps: "12-15",
    weight: 12,
    restTime: 60,
    muscleGroups: ["Biceps"],
    equipment: "Dumbbells",
    difficulty: "beginner",
    instructions: "Curl dumbbells up while keeping elbows at sides",
    notes: "Control the movement, avoid swinging"
  },
  {
    name: "Tricep Dips",
    sets: 3,
    reps: "10-15",
    restTime: 90,
    muscleGroups: ["Triceps", "Chest"],
    equipment: "Dip Bars",
    difficulty: "intermediate",
    instructions: "Lower body between bars, push back up",
    notes: "Keep elbows close to body"
  },
  {
    name: "Tricep Pushdowns",
    sets: 3,
    reps: "12-15",
    weight: 30,
    restTime: 60,
    muscleGroups: ["Triceps"],
    equipment: "Cable Machine",
    difficulty: "beginner",
    instructions: "Push cable down while keeping elbows at sides",
    notes: "Focus on tricep contraction"
  },

  // Leg Exercises
  {
    name: "Squats",
    sets: 4,
    reps: "10-12",
    weight: 80,
    restTime: 120,
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Barbell",
    difficulty: "intermediate",
    instructions: "Lower body as if sitting back, keep chest up",
    notes: "Keep knees in line with toes"
  },
  {
    name: "Leg Press",
    sets: 4,
    reps: "12-15",
    weight: 120,
    restTime: 120,
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Leg Press Machine",
    difficulty: "beginner",
    instructions: "Push platform away with feet shoulder-width apart",
    notes: "Don't lock knees at top"
  },
  {
    name: "Leg Extensions",
    sets: 3,
    reps: "15-20",
    weight: 40,
    restTime: 90,
    muscleGroups: ["Legs"],
    equipment: "Leg Extension Machine",
    difficulty: "beginner",
    instructions: "Extend legs against resistance",
    notes: "Focus on quad contraction"
  },
  {
    name: "Leg Curls",
    sets: 3,
    reps: "12-15",
    weight: 35,
    restTime: 90,
    muscleGroups: ["Legs"],
    equipment: "Leg Curl Machine",
    difficulty: "beginner",
    instructions: "Curl legs against resistance",
    notes: "Focus on hamstring contraction"
  },

  // Core Exercises
  {
    name: "Plank",
    sets: 3,
    duration: 60,
    restTime: 60,
    muscleGroups: ["Core"],
    equipment: "Bodyweight",
    difficulty: "beginner",
    instructions: "Hold body in straight line from head to heels",
    notes: "Keep core tight, don't let hips sag"
  },
  {
    name: "Crunches",
    sets: 3,
    reps: "15-20",
    restTime: 45,
    muscleGroups: ["Core"],
    equipment: "Bodyweight",
    difficulty: "beginner",
    instructions: "Curl upper body toward knees",
    notes: "Focus on abdominal contraction"
  },
  {
    name: "Russian Twists",
    sets: 3,
    reps: "20-25",
    weight: 5,
    restTime: 60,
    muscleGroups: ["Core"],
    equipment: "Dumbbell",
    difficulty: "intermediate",
    instructions: "Rotate torso side to side while holding weight",
    notes: "Keep feet off ground for advanced version"
  },

  // Cardio Exercises
  {
    name: "Treadmill Run",
    sets: 1,
    duration: 1800, // 30 minutes
    muscleGroups: ["Cardio"],
    equipment: "Treadmill",
    difficulty: "beginner",
    instructions: "Run at moderate pace for specified duration",
    notes: "Adjust speed based on fitness level"
  },
  {
    name: "Stationary Bike",
    sets: 1,
    duration: 1200, // 20 minutes
    muscleGroups: ["Cardio"],
    equipment: "Stationary Bike",
    difficulty: "beginner",
    instructions: "Pedal at moderate resistance",
    notes: "Great low-impact cardio option"
  },
  {
    name: "Rowing Machine",
    sets: 1,
    duration: 900, // 15 minutes
    muscleGroups: ["Cardio", "Back", "Legs"],
    equipment: "Rowing Machine",
    difficulty: "intermediate",
    instructions: "Pull handle toward chest while pushing with legs",
    notes: "Full body cardio workout"
  }
];

// Seeder function
export const seedExercises = async () => {
  try {
    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log("Cleared existing exercises");

    // Insert new exercises
    const insertedExercises = await Exercise.insertMany(exercises);
    console.log(`Successfully seeded ${insertedExercises.length} exercises`);

    // Log the seeded exercises by category
    const categories = [...new Set(exercises.flatMap(ex => ex.muscleGroups))];
    categories.forEach(category => {
      const categoryExercises = insertedExercises.filter(ex => 
        ex.muscleGroups.includes(category)
      );
      console.log(`- ${category}: ${categoryExercises.length} exercises`);
    });

    return insertedExercises;
  } catch (error) {
    console.error("Error seeding exercises:", error);
    throw error;
  }
};

// Export the exercise data for testing
export { exercises }; 