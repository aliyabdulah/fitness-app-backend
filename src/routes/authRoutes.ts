import { Router } from "express";
import { 
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
} from "../controllers/AuthControllers";
import { uploadSingle, handleUploadError } from "../middleware/uploadMiddleware";

const router = Router();

// POST /api/auth/register - Register new user (with multipart/form-data support)
router.post("/register", uploadSingle, handleUploadError, register);

// POST /api/auth/login - Login user (JSON only)
router.post("/login", login);

// POST /api/auth/logout - Logout user
router.post("/logout", logout);

// POST /api/auth/refresh - Refresh token
router.post("/refresh", refreshToken);

// POST /api/auth/forgot-password - Forgot password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password - Reset password
router.post("/reset-password", resetPassword);

export default router; 