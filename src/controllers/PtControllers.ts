import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";

// Standard CRUD Operations for PT Users

// GET /api/pt - Get all Personal Trainers
const getAllPTs = async (req: Request, res: Response) => {
  try {
    const pts = await User.find({ role: "pt" }, { password: 0 }).populate(
      "trainees",
      { password: 0 }
    );

    res.status(200).json({
      message: "Personal Trainers retrieved successfully",
      count: pts.length,
      personalTrainers: pts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve Personal Trainers", error });
  }
};

// GET /api/pt/:id - Get Personal Trainer by ID
const getPTById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pt = await User.findById(id, { password: 0 }).populate("trainees", {
      password: 0,
    });

    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(400)
        .json({ message: "User is not a Personal Trainer" });
    }

    res.status(200).json({
      message: "Personal Trainer retrieved successfully",
      personalTrainer: pt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve Personal Trainer", error });
  }
};

// POST /api/pt - Create new Personal Trainer
const createPT = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      // Optional fields
      age,
      weight,
      height,
      fitnessLevel,
      fitnessGoal,
      workoutFrequency,
      profilePicture,
    } = req.body;

    // Validate required fields for PT
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Email, password, first name, and last name are required for PT registration",
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new PT user - optional fields will be undefined if not provided
    const newPT = new User({
      email,
      password, // Note: In production, password should be hashed
      firstName,
      lastName,
      age,
      weight,
      height,
      fitnessLevel,
      fitnessGoal,
      workoutFrequency,
      profilePicture,
      role: "pt", // Set role as PT
      trainees: [], // Initialize empty trainees array
    });

    const savedPT = await newPT.save();

    // Remove password from response
    const { password: _, ...ptWithoutPassword } = savedPT.toObject();

    res.status(201).json({
      message: "Personal Trainer created successfully",
      personalTrainer: ptWithoutPassword,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create Personal Trainer", error });
  }
};

// PUT /api/pt/:id - Update Personal Trainer
const updatePT = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      age,
      weight,
      height,
      fitnessLevel,
      fitnessGoal,
      workoutFrequency,
      profilePicture,
    } = req.body;

    // Check if PT exists
    const pt = await User.findById(id);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(400)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== pt.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    // Update PT
    const updatedPT = await User.findByIdAndUpdate(
      id,
      {
        email,
        firstName,
        lastName,
        age,
        weight,
        height,
        fitnessLevel,
        fitnessGoal,
        workoutFrequency,
        profilePicture,
      },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("trainees", { password: 0 });

    res.status(200).json({
      message: "Personal Trainer updated successfully",
      personalTrainer: updatedPT,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update Personal Trainer", error });
  }
};

// DELETE /api/pt/:id - Delete Personal Trainer
const deletePT = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if PT exists
    const pt = await User.findById(id);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(400)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Remove PT reference from all their trainees
    if (pt.trainees && pt.trainees.length > 0) {
      await User.updateMany(
        { _id: { $in: pt.trainees } },
        { $unset: { personalTrainer: 1 } }
      );
    }

    // Delete the PT
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "Personal Trainer deleted successfully",
      deletedPTId: id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete Personal Trainer", error });
  }
};

// Trainee Management Functions

// GET /api/pt/:ptId/trainees - Get all trainees supervised by PT
const getAllTrainees = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params; // PT ID from route params or auth middleware

    // Find the PT user and populate their trainees
    const pt = await User.findById(ptId).populate("trainees", { password: 0 });

    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    res.status(200).json({
      message: "Trainees retrieved successfully",
      count: pt.trainees?.length || 0,
      trainees: pt.trainees || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve trainees", error });
  }
};

// GET /api/pt/:ptId/trainees/:traineeId - Get specific trainee by ID
const getTraineeById = async (req: Request, res: Response) => {
  try {
    const { ptId, traineeId } = req.params;

    // Verify PT exists and has permission
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Check if trainee is supervised by this PT
    if (
      !pt.trainees?.some(
        (traineeObjectId) => traineeObjectId.toString() === traineeId
      )
    ) {
      return res
        .status(403)
        .json({ message: "Trainee is not supervised by this PT" });
    }

    // Get trainee details
    const trainee = await User.findById(traineeId, { password: 0 });
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    res.status(200).json({
      message: "Trainee retrieved successfully",
      trainee: trainee,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve trainee", error });
  }
};

// POST /api/pt/:ptId/trainees/request - Handle trainee request to PT
const handleTraineeRequest = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;
    const { traineeId, action } = req.body; // action: 'accept' or 'reject'

    // Validate input
    if (!traineeId || !action) {
      return res
        .status(400)
        .json({ message: "Trainee ID and action are required" });
    }

    if (!["accept", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be 'accept' or 'reject'" });
    }

    // Find PT and trainee
    const pt = await User.findById(ptId);
    const trainee = await User.findById(traineeId);

    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    if (trainee.role !== "trainee") {
      return res.status(403).json({ message: "User is not a trainee" });
    }

    // Check if trainee is already supervised by this PT
    if (
      pt.trainees?.some(
        (traineeObjectId) => traineeObjectId.toString() === traineeId
      )
    ) {
      return res
        .status(400)
        .json({ message: "Trainee is already supervised by this PT" });
    }

    if (action === "accept") {
      // Add trainee to PT's trainees list
      await User.findByIdAndUpdate(
        ptId,
        { $addToSet: { trainees: traineeId } }, // $addToSet prevents duplicates
        { new: true }
      );

      // Update trainee's PT reference
      await User.findByIdAndUpdate(
        traineeId,
        { personalTrainer: ptId },
        { new: true }
      );

      res.status(200).json({
        message: "Trainee request accepted successfully",
        trainee: {
          id: trainee._id,
          name: trainee.name,
          email: trainee.email,
        },
      });
    } else {
      // Handle rejection - could log this or notify trainee
      res.status(200).json({
        message: "Trainee request rejected",
        traineeId: traineeId,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to handle trainee request", error });
  }
};

// GET /api/pt/:ptId/pending-requests - Get pending trainee requests for PT
const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;

    // TODO: Implement pending requests logic
    // This would require a separate model/schema for requests
    res.status(200).json({
      message: "Get pending requests - Not implemented yet",
      note: "This would require a TraineeRequest model to store pending requests",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve pending requests", error });
  }
};

// DELETE /api/pt/:ptId/trainees/:traineeId - Remove trainee from PT supervision
const removeTrainee = async (req: Request, res: Response) => {
  try {
    const { ptId, traineeId } = req.params;

    // Verify PT exists
    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res
        .status(403)
        .json({ message: "User is not a Personal Trainer" });
    }

    // Check if trainee is supervised by this PT
    if (
      !pt.trainees?.some(
        (traineeObjectId) => traineeObjectId.toString() === traineeId
      )
    ) {
      return res
        .status(404)
        .json({ message: "Trainee is not supervised by this PT" });
    }

    // Remove trainee from PT's list
    await User.findByIdAndUpdate(
      ptId,
      { $pull: { trainees: traineeId } },
      { new: true }
    );

    // Remove PT reference from trainee
    await User.findByIdAndUpdate(
      traineeId,
      { $unset: { personalTrainer: 1 } },
      { new: true }
    );

    res.status(200).json({
      message: "Trainee removed from supervision successfully",
      traineeId: traineeId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove trainee", error });
  }
};

// Export all functions at the end
export {
  // Standard CRUD operations for PT users
  getAllPTs,
  getPTById,
  createPT,
  updatePT,
  deletePT,
  // Trainee management functions
  getAllTrainees,
  getTraineeById,
  handleTraineeRequest,
  getPendingRequests,
  removeTrainee,
};
