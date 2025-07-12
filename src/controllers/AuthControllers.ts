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
      age,
      weight,
      height,
      fitnessLevel,
      fitnessGoal,
      workoutFrequency
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Missing required fields: email, password, firstName, lastName" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age: parseInt(age) || 25,
      weight: parseInt(weight) || 70,
      height: parseInt(height) || 170,
      fitnessLevel: fitnessLevel || "beginner",
      fitnessGoal: fitnessGoal || "stay_fit",
      workoutFrequency: parseInt(workoutFrequency) || 3,
      profilePicture: req.file ? req.file.path : undefined
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "24h" }
    );

    // Send response
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        age: newUser.age,
        weight: newUser.weight,
        height: newUser.height,
        fitnessLevel: newUser.fitnessLevel,
        fitnessGoal: newUser.fitnessGoal,
        workoutFrequency: newUser.workoutFrequency,
        profilePicture: newUser.profilePicture
      }
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
      return res.status(400).json({ message: "Email and password are required" });
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
        profilePicture: user.profilePicture
      }
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