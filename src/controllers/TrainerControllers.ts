import { Request, Response } from "express";
import User from "../models/User";

// GET /api/trainers - List all trainers
export const getAllTrainers = async (req: Request, res: Response) => {
  try {
    const trainers = await User.find({ role: "pt" }, { password: 0 })
      .populate("trainees", { password: 0 });
    res.status(200).json({ trainers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainers", error });
  }
};

// GET /api/trainers/:id - Get trainer by ID
export const getTrainerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trainer = await User.findById(id, { password: 0 })
      .populate("trainees", { password: 0 });
    
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    
    if (trainer.role !== "pt") {
      return res.status(404).json({ message: "User is not a trainer" });
    }
    
    res.status(200).json({ trainer });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainer", error });
  }
};

// POST /api/trainers/seed-all - Seed all Kuwaiti trainers
export const seedAllTrainers = async (req: Request, res: Response) => {
  try {
    // Since Trainer model is deleted, this function should be updated or removed
    // For now, let's return a message that seeding is no longer needed
    res.status(200).json({
      message: "Trainer seeding is no longer needed. Trainers are now User documents with role: 'pt'",
      note: "Use the migrated trainers or create new PT users via the PT creation endpoint"
    });
  } catch (error) {
    console.error("Error in seedAllTrainers:", error);
    res.status(500).json({ 
      message: "Trainer seeding is no longer supported", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// PT Functions (Personal Trainer User Management)

// GET /api/trainers/pt - Get all Personal Trainers
export const getAllPTs = async (req: Request, res: Response) => {
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

// GET /api/trainers/pt/:id - Get Personal Trainer by ID
export const getPTById = async (req: Request, res: Response) => {
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

// POST /api/trainers/pt - Create new Personal Trainer
export const createPT = async (req: Request, res: Response) => {
  try {
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

    // Create new PT user
    const newPT = new User({
      email,
      password,
      firstName,
      lastName,
      age,
      weight,
      height,
      fitnessLevel,
      fitnessGoal,
      workoutFrequency,
      profilePicture,
      role: "pt",
      trainees: [],
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

// PUT /api/trainers/pt/:id - Update Personal Trainer
export const updatePT = async (req: Request, res: Response) => {
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

// DELETE /api/trainers/pt/:id - Delete Personal Trainer
export const deletePT = async (req: Request, res: Response) => {
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

// GET /api/trainers/pt/:ptId/trainees - Get all trainees supervised by PT
export const getAllTrainees = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;

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

// GET /api/trainers/pt/:ptId/trainees/:traineeId - Get specific trainee by ID
export const getTraineeById = async (req: Request, res: Response) => {
  try {
    const { ptId, traineeId } = req.params;

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

// POST /api/trainers/pt/:ptId/trainees/request - Handle trainee request to PT
export const handleTraineeRequest = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;
    const { traineeId, action } = req.body;

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
        { $addToSet: { trainees: traineeId } },
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

// DELETE /api/trainers/pt/:ptId/trainees/:traineeId - Remove trainee from PT supervision
export const removeTrainee = async (req: Request, res: Response) => {
  try {
    const { ptId, traineeId } = req.params;

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

// POST /api/trainers/submit-request - Submit trainee request to PT
export const submitTraineeRequest = async (req: Request, res: Response) => {
  try {
    const { traineeId, ptId, serviceName, message } = req.body;

    // Debug logging
    console.log('=== Training Request Debug ===');
    console.log('Request body:', req.body);
    console.log('traineeId:', traineeId);
    console.log('ptId:', ptId);
    console.log('serviceName:', serviceName);
    console.log('message:', message);

    // Validate required fields
    if (!traineeId || !ptId || !serviceName) {
      console.log('Validation failed - missing required fields');
      console.log('traineeId exists:', !!traineeId);
      console.log('ptId exists:', !!ptId);
      console.log('serviceName exists:', !!serviceName);
      return res.status(400).json({ 
        message: "Trainee ID, PT ID, and service name are required",
        received: { traineeId, ptId, serviceName }
      });
    }

    // Check if trainee exists
    const trainee = await User.findById(traineeId);
    console.log('Trainee found:', !!trainee);
    if (trainee) {
      console.log('Trainee role:', trainee.role);
      console.log('Trainee name:', trainee.name);
    }
    
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    // Check if PT exists
    const pt = await User.findById(ptId);
    console.log('PT found:', !!pt);
    if (pt) {
      console.log('PT role:', pt.role);
      console.log('PT name:', pt.name);
    }
    
    if (!pt || pt.role !== "pt") {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    // Check if trainee is already supervised by this PT
    const isAlreadySupervised = pt.trainees?.some(id => id.toString() === traineeId);
    console.log('Already supervised:', isAlreadySupervised);
    
    if (isAlreadySupervised) {
      // If already supervised, just return success (they can apply for different services)
      console.log('Returning success for already supervised trainee');
      res.status(200).json({
        message: "Training request submitted successfully",
        trainee: {
          id: trainee._id,
          name: trainee.name,
          email: trainee.email,
        },
        pt: {
          id: pt._id,
          name: pt.name,
          email: pt.email,
        },
        serviceName,
        requestMessage: message,
        note: "You are already supervised by this trainer"
      });
      return;
    }

    // Add trainee to PT's trainees list (if not already there)
    console.log('Adding trainee to PT trainees list');
    await User.findByIdAndUpdate(
      ptId,
      { $addToSet: { trainees: traineeId } },
      { new: true }
    );

    console.log('Training request successful');
    res.status(200).json({
      message: "Training request submitted and accepted successfully",
      trainee: {
        id: trainee._id,
        name: trainee.name,
        email: trainee.email,
      },
      pt: {
        id: pt._id,
        name: pt.name,
        email: pt.email,
      },
      serviceName,
      requestMessage: message,
    });
  } catch (error) {
    console.error('Error in submitTraineeRequest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: "Failed to submit training request", error: errorMessage });
  }
};
