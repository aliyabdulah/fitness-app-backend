import { Request, Response } from "express";
import User from "../models/User";
import WorkoutAssignment from "../models/WorkoutAssignment"; // Added import for WorkoutAssignment
import Workout from "../models/Workout"; // Added import for Workout
import WorkoutTemplate from "../models/WorkoutTemplate";

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

    // Add trainee request to PT's traineeRequests array
    await User.findByIdAndUpdate(
      ptId,
      { 
        $push: { 
          traineeRequests: {
            traineeId,
            status: 'pending',
            serviceName,
            requestDate: new Date()
          }
        }
      },
      { new: true }
    );

    console.log('Training request successful');
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
    });
  } catch (error) {
    console.error('Error in submitTraineeRequest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: "Failed to submit training request", error: errorMessage });
  }
};

export const getTraineesWithStatus = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;

    const pt = await User.findById(ptId)
      .populate('traineeRequests.traineeId', { password: 0 });

    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
    }

    // Group trainees by status
    const traineesByStatus = {
      pending: pt.traineeRequests?.filter(req => req.status === 'pending') || [],
      approved: pt.traineeRequests?.filter(req => req.status === 'approved') || [],
      rejected: pt.traineeRequests?.filter(req => req.status === 'rejected') || [],
    };

    res.status(200).json({
      message: "Trainees with status retrieved successfully",
      trainees: traineesByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve trainees with status", error });
  }
};

// Add this temporary debug endpoint
export const debugPTRequests = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;
    
    const pt = await User.findById(ptId)
      .populate('traineeRequests.traineeId', { password: 0 });
    
    if (!pt) {
      return res.status(404).json({ message: "PT not found" });
    }
    
    console.log('=== DEBUG PT REQUESTS ===');
    console.log('PT ID:', ptId);
    console.log('PT traineeRequests:', pt.traineeRequests);
    console.log('PT trainees array:', pt.trainees);
    
    res.status(200).json({
      message: "Debug info",
      ptId,
      traineeRequests: pt.traineeRequests || [],
      trainees: pt.trainees || [],
      totalRequests: pt.traineeRequests?.length || 0
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: "Debug failed", error });
  }
};

export const approveTraineeRequest = async (req: Request, res: Response) => {
  try {
    const { ptId, requestId } = req.params;

    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
    }

    // Find the request by traineeId (since requestId is actually the traineeId)
    const request = pt.traineeRequests?.find(req => 
      req.traineeId.toString() === requestId && req.status === 'pending'
    );

    if (!request) {
      return res.status(404).json({ message: "Pending request not found" });
    }

    // Update request status to approved using array index
    const requestIndex = pt.traineeRequests!.findIndex(req => 
      req.traineeId.toString() === requestId && req.status === 'pending'
    );

    await User.updateOne(
      { _id: ptId },
      { $set: { [`traineeRequests.${requestIndex}.status`]: "approved" } }
    );

    // Add trainee to PT's trainees list
    await User.findByIdAndUpdate(
      ptId,
      { $addToSet: { trainees: request.traineeId } }
    );

    // Update trainee's personalTrainer field
    await User.findByIdAndUpdate(
      request.traineeId,
      { personalTrainer: ptId }
    );

    res.status(200).json({
      message: "Trainee request approved successfully",
      requestId,
      traineeId: request.traineeId
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve trainee request", error });
  }
};

export const rejectTraineeRequest = async (req: Request, res: Response) => {
  try {
    const { ptId, requestId } = req.params;

    const pt = await User.findById(ptId);
    if (!pt) {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    if (pt.role !== "pt") {
      return res.status(403).json({ message: "User is not a Personal Trainer" });
    }

    // Find the request by traineeId (since requestId is actually the traineeId)
    const request = pt.traineeRequests?.find(req => 
      req.traineeId.toString() === requestId && req.status === 'pending'
    );

    if (!request) {
      return res.status(404).json({ message: "Pending request not found" });
    }

    // Update request status to rejected using array index
    const requestIndex = pt.traineeRequests!.findIndex(req => 
      req.traineeId.toString() === requestId && req.status === 'pending'
    );

    await User.updateOne(
      { _id: ptId },
      { $set: { [`traineeRequests.${requestIndex}.status`]: "rejected" } }
    );

    res.status(200).json({
      message: "Trainee request rejected successfully",
      requestId
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject trainee request", error });
  }
};

export const assignWorkoutToTrainee = async (req: Request, res: Response) => {
  try {
    const { traineeId, workoutPlanId, assignedDate, ptId } = req.body;

    console.log('=== ASSIGN WORKOUT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('traineeId:', traineeId);
    console.log('workoutPlanId:', workoutPlanId);
    console.log('assignedDate:', assignedDate);
    console.log('ptId:', ptId);

    // Validate required fields
    if (!traineeId || !workoutPlanId || !assignedDate || !ptId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify PT exists and is authorized
    const pt = await User.findById(ptId);
    if (!pt || pt.role !== "pt") {
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    // Verify trainee exists
    const trainee = await User.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    // Verify workout template exists - Use WorkoutTemplate model instead of Workout
    const workoutTemplate = await WorkoutTemplate.findById(workoutPlanId);
    if (!workoutTemplate) {
      return res.status(404).json({ message: "Workout template not found" });
    }

    // Create workout assignment using correct field names from the model
    const workoutAssignment = new WorkoutAssignment({
      workout: workoutPlanId, // Use the actual workout template ID
      assignedTo: traineeId,   // Trainee this workout is assigned to
      assignedBy: ptId,        // PT who assigned it
      assignedDate: new Date(assignedDate),
      status: 'assigned'
    });

    await workoutAssignment.save();

    console.log('Workout assignment created:', workoutAssignment);

    res.status(200).json({
      message: "Workout assigned successfully",
      assignment: workoutAssignment
    });
  } catch (error) {
    console.error('Error in assignWorkoutToTrainee:', error);
    res.status(500).json({ message: "Failed to assign workout", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getWorkoutTemplates = async (req: Request, res: Response) => {
  try {
    const { ptId } = req.params;

    console.log('=== GET WORKOUT TEMPLATES DEBUG ===');
    console.log('PT ID:', ptId);

    // Verify PT exists
    const pt = await User.findById(ptId);
    if (!pt || pt.role !== "pt") {
      console.log('PT not found or not a PT');
      return res.status(404).json({ message: "Personal Trainer not found" });
    }

    console.log('PT found:', pt.firstName, pt.lastName);

    // Use the imported WorkoutTemplate model (not require)
    const workoutTemplates = await WorkoutTemplate.find({ createdBy: ptId })
      .select('title description difficulty estimatedDuration exercises');

    console.log('Found workout templates:', workoutTemplates.length);
    console.log('Templates:', workoutTemplates);

    res.status(200).json({
      message: "Workout templates retrieved successfully",
      templates: workoutTemplates
    });
  } catch (error) {
    console.error('Error in getWorkoutTemplates:', error);
    res.status(500).json({ message: "Failed to retrieve workout templates", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
