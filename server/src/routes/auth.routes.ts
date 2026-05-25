import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

import {
  adminLoginController,
  changePassword,
  getCurrentUserController,
  logoutUser,
  refreshAccessTokenController,
  sendSecurityOTP,
  toggleTwoStep,
  updateAvatar,
  updateProfile,
  updateTwoStepEmail,
  verifyOtpController,
} from "../controllers/auth.controller";
import { uploadTo } from "../middlewares/upload.middleware";


const router = Router();

// Protected → Get current user
router.get("/me", verifyJWT, getCurrentUserController);
router.post("/request-security-otp", verifyJWT, sendSecurityOTP);

// Public → Admin tries to log in (step 1: send OTP)
router.post("/login", adminLoginController);



// Public → Admin verifies OTP (step 2: complete login)
router.post("/verify-code", verifyOtpController);

// Protected → Refresh access token
router.get("/refresh-token", refreshAccessTokenController);

// Protected → Logout
router.post("/logout", verifyJWT, logoutUser);

router.patch(
  "/update-avatar",
  verifyJWT,
  uploadTo("account").fields([{ name: "avatar", maxCount: 1 }]),
  updateAvatar
);

router.patch("/profile", verifyJWT, updateProfile);
router.patch("/password", verifyJWT, changePassword);
router.patch("/two-step", verifyJWT, toggleTwoStep);
router.patch("/add-two-step", verifyJWT, updateTwoStepEmail);

export default router;
