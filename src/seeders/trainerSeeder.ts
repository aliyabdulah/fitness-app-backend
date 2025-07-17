import mongoose from "mongoose";
import Trainer from "../models/Trainer";

// Kuwaiti trainer data with professional images
const kuwaitiTrainers = [
  {
    name: "Ahmed Al-Rashid",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face",
    bio: "Certified personal trainer with 8+ years of experience in bodybuilding and strength training. Specializes in muscle building, weight loss, and athletic performance. Fluent in Arabic and English.",
    instagram: "https://instagram.com/ahmedalrashid_fitness",
    services: [
      {
        name: "One on One Training",
        description: "Personalized training sessions tailored to your goals",
        price: "60 KWD / session",
        isPopular: true,
      },
      {
        name: "Supervision",
        description: "Workout supervision & guidance",
        price: "180 KWD / month",
      },
      {
        name: "Health Plan",
        description: "Complete nutrition & workout plan",
        price: "250 KWD / month",
      },
    ],
    stats: {
      clientsCoached: "150+",
      yearsExperience: 8,
      rating: 4.9,
      certifications: 5,
    },
  },
  {
    name: "Fatima Al-Zahra",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face",
    bio: "Women's fitness specialist with expertise in prenatal and postnatal training. Certified in yoga, pilates, and functional training. Dedicated to empowering women through fitness.",
    instagram: "https://instagram.com/fatima_fitness_kw",
    services: [
      {
        name: "Women's Fitness",
        description: "Specialized training for women",
        price: "55 KWD / session",
        isPopular: true,
      },
      {
        name: "Prenatal Training",
        description: "Safe pregnancy fitness programs",
        price: "70 KWD / session",
      },
      {
        name: "Yoga & Pilates",
        description: "Mind-body fitness classes",
        price: "45 KWD / session",
      },
    ],
    stats: {
      clientsCoached: "120+",
      yearsExperience: 6,
      rating: 4.8,
      certifications: 4,
    },
  },
  {
    name: "Omar Al-Mansouri",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=face",
    bio: "Former professional athlete turned fitness coach. Specializes in sports performance, functional training, and rehabilitation. Works with athletes and fitness enthusiasts of all levels.",
    instagram: "https://instagram.com/omar_performance",
    services: [
      {
        name: "Sports Performance",
        description: "Athletic training and conditioning",
        price: "75 KWD / session",
        isPopular: true,
      },
      {
        name: "Functional Training",
        description: "Movement-based fitness programs",
        price: "60 KWD / session",
      },
      {
        name: "Rehabilitation",
        description: "Injury recovery and prevention",
        price: "80 KWD / session",
      },
    ],
    stats: {
      clientsCoached: "200+",
      yearsExperience: 10,
      rating: 4.9,
      certifications: 6,
    },
  },
  {
    name: "Noor Al-Sabah",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face",
    bio: "HIIT and cardio specialist with a passion for high-energy workouts. Certified in CrossFit, boxing, and circuit training. Creates dynamic, engaging sessions that push limits.",
    instagram: "https://instagram.com/noor_hiit_kw",
    services: [
      {
        name: "HIIT Training",
        description: "High-intensity interval training",
        price: "50 KWD / session",
        isPopular: true,
      },
      {
        name: "Boxing Fitness",
        description: "Boxing-based cardio workouts",
        price: "65 KWD / session",
      },
      {
        name: "Circuit Training",
        description: "Full-body circuit workouts",
        price: "55 KWD / session",
      },
    ],
    stats: {
      clientsCoached: "180+",
      yearsExperience: 5,
      rating: 4.7,
      certifications: 3,
    },
  },
  {
    name: "Yousef Al-Hamdan",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face",
    bio: "Nutrition and wellness coach specializing in weight management and lifestyle transformation. Combines fitness training with personalized nutrition plans for optimal results.",
    instagram: "https://instagram.com/yousef_wellness",
    services: [
      {
        name: "Weight Management",
        description: "Comprehensive weight loss programs",
        price: "200 KWD / month",
        isPopular: true,
      },
      {
        name: "Nutrition Coaching",
        description: "Personalized meal planning",
        price: "150 KWD / month",
      },
      {
        name: "Lifestyle Transformation",
        description: "Complete lifestyle makeover",
        price: "300 KWD / month",
      },
    ],
    stats: {
      clientsCoached: "90+",
      yearsExperience: 7,
      rating: 4.8,
      certifications: 4,
    },
  },
  {
    name: "Aisha Al-Qassimi",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=face",
    bio: "Senior fitness trainer with expertise in senior fitness, flexibility, and mobility training. Focuses on maintaining independence and quality of life through safe, effective exercise.",
    instagram: "https://instagram.com/aisha_senior_fitness",
    services: [
      {
        name: "Senior Fitness",
        description: "Age-appropriate training programs",
        price: "45 KWD / session",
        isPopular: true,
      },
      {
        name: "Flexibility Training",
        description: "Mobility and flexibility improvement",
        price: "40 KWD / session",
      },
      {
        name: "Balance Training",
        description: "Fall prevention and balance work",
        price: "50 KWD / session",
      },
    ],
    stats: {
      clientsCoached: "75+",
      yearsExperience: 12,
      rating: 4.9,
      certifications: 5,
    },
  },
];

// Seeder function
export const seedTrainers = async () => {
  try {
    // Clear existing trainers
    await Trainer.deleteMany({});
    console.log("Cleared existing trainers");

    // Insert new trainers
    const insertedTrainers = await Trainer.insertMany(kuwaitiTrainers);
    console.log(`Successfully seeded ${insertedTrainers.length} Kuwaiti trainers`);

    // Log the seeded trainers
    insertedTrainers.forEach((trainer) => {
      console.log(`- ${trainer.name}: ${trainer.services[0].name}`);
    });

    return insertedTrainers;
  } catch (error) {
    console.error("Error seeding trainers:", error);
    throw error;
  }
};

// Export the trainer data for testing
export { kuwaitiTrainers }; 