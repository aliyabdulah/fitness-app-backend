import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend Request interface to include file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// POST /api/auth/register - Register new user
export const register = async (req: MulterRequest, res: Response) => {
  try {
    console.log("Request body:", req.body); // Debug log
    console.log("Request file:", req.file); // Debug log

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      age,
      weight,
      height,
      fitnessLevel,
      fitnessGoal,
      workoutFrequency,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        message:
          "Missing required fields: email, password, firstName, lastName, role",
      });
    }

    // Validate role
    if (!["trainee", "pt"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'trainee' or 'pt'",
      });
    }

    // Role-based validation
    if (role === "trainee") {
      // Trainees must provide ALL fitness information
      if (
        !age ||
        !weight ||
        !height ||
        !fitnessLevel ||
        !fitnessGoal ||
        workoutFrequency === undefined
      ) {
        return res.status(400).json({
          message:
            "Trainees must provide age, weight, height, fitnessLevel, fitnessGoal, and workoutFrequency",
        });
      }

      // Validate fitness field values for trainees
      if (isNaN(parseInt(age)) || parseInt(age) < 1 || parseInt(age) > 120) {
        return res
          .status(400)
          .json({ message: "Age must be a valid number between 1-120" });
      }
      if (isNaN(parseInt(weight)) || parseInt(weight) < 1) {
        return res
          .status(400)
          .json({ message: "Weight must be a valid positive number" });
      }
      if (isNaN(parseInt(height)) || parseInt(height) < 1) {
        return res
          .status(400)
          .json({ message: "Height must be a valid positive number" });
      }
      if (!["beginner", "intermediate", "advanced"].includes(fitnessLevel)) {
        return res.status(400).json({
          message:
            "Fitness level must be 'beginner', 'intermediate', or 'advanced'",
        });
      }
      if (
        ![
          "lose_weight",
          "build_muscle",
          "stay_fit",
          "endurance",
          "flexibility",
        ].includes(fitnessGoal)
      ) {
        return res.status(400).json({ message: "Invalid fitness goal" });
      }
      if (isNaN(parseInt(workoutFrequency)) || parseInt(workoutFrequency) < 0) {
        return res.status(400).json({
          message: "Workout frequency must be a valid non-negative number",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare user data based on role
    const userData: any = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      profilePicture: req.file ? req.file.path : undefined,
    };

    // Add fitness fields only if role is trainee (required) or if PT provided them (optional)
    if (role === "trainee") {
      userData.age = parseInt(age);
      userData.weight = parseInt(weight);
      userData.height = parseInt(height);
      userData.fitnessLevel = fitnessLevel;
      userData.fitnessGoal = fitnessGoal;
      userData.workoutFrequency = parseInt(workoutFrequency);
    } else if (role === "pt") {
      // For PTs, only add fitness fields if they were provided
      if (age) userData.age = parseInt(age);
      if (weight) userData.weight = parseInt(weight);
      if (height) userData.height = parseInt(height);
      if (fitnessLevel) userData.fitnessLevel = fitnessLevel;
      if (fitnessGoal) userData.fitnessGoal = fitnessGoal;
      if (workoutFrequency !== undefined)
        userData.workoutFrequency = parseInt(workoutFrequency);

      // Initialize trainees array for PTs
      userData.trainees = [];
    }

    // Create new user
    const newUser = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "24h" }
    );

    // Prepare response user object (exclude password)
    const userResponse: any = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      name: newUser.name,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
    };

    // Add fitness fields to response if they exist
    if (newUser.age !== undefined) userResponse.age = newUser.age;
    if (newUser.weight !== undefined) userResponse.weight = newUser.weight;
    if (newUser.height !== undefined) userResponse.height = newUser.height;
    if (newUser.fitnessLevel) userResponse.fitnessLevel = newUser.fitnessLevel;
    if (newUser.fitnessGoal) userResponse.fitnessGoal = newUser.fitnessGoal;
    if (newUser.workoutFrequency !== undefined)
      userResponse.workoutFrequency = newUser.workoutFrequency;

    // Add role-specific fields
    if (newUser.role === "pt" && newUser.trainees) {
      userResponse.trainees = newUser.trainees;
    }
    if (newUser.role === "trainee" && newUser.personalTrainer) {
      userResponse.personalTrainer = newUser.personalTrainer;
    }

    // Send response
    res.status(201).json({
      message: `${
        role === "trainee" ? "Trainee" : "Personal Trainer"
      } registered successfully`,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user", error });
  }
};

// POST /api/auth/login - Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "24h" }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        weight: user.weight,
        height: user.height,
        fitnessLevel: user.fitnessLevel,
        fitnessGoal: user.fitnessGoal,
        workoutFrequency: user.workoutFrequency,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login", error });
  }
};

// POST /api/auth/logout - Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    // TODO: Implement user logout logic
    // - Invalidate token
    res.status(200).json({ message: "User logout - Not implemented yet" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/refresh - Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // TODO: Implement token refresh logic
    // - Validate refresh token
    // - Generate new access token
    res.status(200).json({ message: "Token refresh - Not implemented yet" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/forgot-password - Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // TODO: Implement forgot password logic
    // - Generate reset token
    // - Send email with reset link
    res.status(200).json({ message: "Forgot password - Not implemented yet" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/reset-password - Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // TODO: Implement reset password logic
    // - Validate reset token
    // - Update user password
    res.status(200).json({ message: "Reset password - Not implemented yet" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
