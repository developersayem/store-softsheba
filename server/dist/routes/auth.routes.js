"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// Protected → Get current user
router.get("/me", auth_middleware_1.verifyJWT, auth_controller_1.getCurrentUserController);
router.post("/request-security-otp", auth_middleware_1.verifyJWT, auth_controller_1.sendSecurityOTP);
// Public → Admin tries to log in (step 1: send OTP)
router.post("/login", auth_controller_1.adminLoginController);
// Public → Admin verifies OTP (step 2: complete login)
router.post("/verify-code", auth_controller_1.verifyOtpController);
// Protected → Refresh access token
router.get("/refresh-token", auth_controller_1.refreshAccessTokenController);
// Protected → Logout
router.post("/logout", auth_middleware_1.verifyJWT, auth_controller_1.logoutUser);
router.patch("/update-avatar", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("account").fields([{ name: "avatar", maxCount: 1 }]), auth_controller_1.updateAvatar);
router.patch("/profile", auth_middleware_1.verifyJWT, auth_controller_1.updateProfile);
router.patch("/password", auth_middleware_1.verifyJWT, auth_controller_1.changePassword);
router.patch("/two-step", auth_middleware_1.verifyJWT, auth_controller_1.toggleTwoStep);
router.patch("/add-two-step", auth_middleware_1.verifyJWT, auth_controller_1.updateTwoStepEmail);
exports.default = router;
