import { Router } from "express";
import multer from "multer";
import { 
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
} from "../controllers/AuthControllers";

const router = Router();

// Configure multer for handling file uploads and form data
const upload = multer({ dest: 'uploads/' });

// POST /api/auth/register - Register new user (with multipart/form-data support)
router.post("/register", upload.single('image'), register);

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