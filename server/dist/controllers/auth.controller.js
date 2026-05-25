"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSecurityOTP = exports.updateTwoStepEmail = exports.toggleTwoStep = exports.changePassword = exports.updateAvatar = exports.updateProfile = exports.logoutUser = exports.refreshAccessTokenController = exports.verifyOtpController = exports.adminLoginController = exports.getCurrentUserController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const user_model_1 = require("../models/user.model");
const generateAccessTokenAndRefreshToken_1 = require("../helper/generateAccessTokenAndRefreshToken");
const cookieOptions_1 = require("../utils/cookieOptions");
const gmailMailer_1 = require("../email/gmailMailer");
const templates_1 = require("../email/templates");
const file_service_1 = require("../services/utils/file.service");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const store_model_1 = require("../models/store.model");
//* =============== Get Current User ===============
exports.getCurrentUserController = (0, asyncHandler_1.default)(async (req, res) => {
    const authenticatedReq = req;
    const user = await user_model_1.User.findById(authenticatedReq.user._id)
        .select("-password -refreshToken -loginOtp -otpExpires")
        .populate("storeId");
    if (!user) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, {}, "User not found"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, (0, image_resolver_plugin_1.resolveImageUrls)(user, ["avatar"]), "Current user fetched successfully"));
});
//* =============== Admin Login (Step 1: Send OTP) ===============
exports.adminLoginController = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new ApiError_1.ApiError(400, "Email and password are required");
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (user.isActive === false) {
        throw new ApiError_1.ApiError(403, "Your account has been restricted. Please contact the administrator.");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    if (user.twoStepEnabled) {
        // --- Scenario A: 2FA is ON (Send OTP) ---
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.loginOtp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await user.save();
        // Fetch store name for store-branded email
        const store = user.storeId ? await store_model_1.Store.findById(user.storeId).select("name").lean() : null;
        const subject = "Your Verification Code";
        await (0, gmailMailer_1.sendGmailMail)(user.twoStepEmail ? user.twoStepEmail : user.email, subject, (0, templates_1.otpTemplate)(otp, store?.name));
        return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            twoStepEnabled: true,
            email: user.twoStepEmail ? user.twoStepEmail : user.email,
        }, "OTP sent to your email"));
    }
    else {
        // --- Scenario B: 2FA is OFF (Direct Login) ---
        const { accessToken, refreshToken } = await (0, generateAccessTokenAndRefreshToken_1.generateAccessTokenAndRefreshToken)(user._id.toString());
        user.refreshToken = refreshToken;
        await user.save();
        const safeUser = await user_model_1.User.findById(user._id)
            .select("-password -refreshToken -loginOtp -otpExpires")
            .populate("storeId");
        return res
            .cookie("accessToken", accessToken, cookieOptions_1.cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions_1.cookieOptions)
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, { accessToken, user: safeUser }, "Login successful"));
    }
});
//* =============== Verify OTP (Step 2: Complete Login) ===============
exports.verifyOtpController = (0, asyncHandler_1.default)(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code)
        throw new ApiError_1.ApiError(400, "Email and OTP are required");
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (!user.loginOtp || !user.otpExpires) {
        throw new ApiError_1.ApiError(400, "No OTP found. Please request a new one");
    }
    if (user.otpExpires.getTime() < Date.now()) {
        throw new ApiError_1.ApiError(400, "OTP has expired");
    }
    if (user.loginOtp !== code) {
        throw new ApiError_1.ApiError(401, "Invalid OTP");
    }
    // OTP valid → clear it and issue tokens
    user.loginOtp = undefined;
    user.otpExpires = undefined;
    const { accessToken, refreshToken } = await (0, generateAccessTokenAndRefreshToken_1.generateAccessTokenAndRefreshToken)(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();
    const safeUser = await user_model_1.User.findById(user._id)
        .select("-password -refreshToken")
        .populate("storeId");
    res
        .cookie("accessToken", accessToken, cookieOptions_1.cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions_1.cookieOptions)
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { accessToken, user: safeUser }, "Login successful"));
});
//* ===============  Refresh Access Token ===============
exports.refreshAccessTokenController = (0, asyncHandler_1.default)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
        throw new ApiError_1.ApiError(401, "No refresh token");
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    }
    catch {
        throw new ApiError_1.ApiError(401, "Invalid or expired refresh token");
    }
    const user = await user_model_1.User.findById(decoded._id);
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (user.isActive === false) {
        throw new ApiError_1.ApiError(403, "Your account has been restricted. Please contact the administrator.");
    }
    // Rotate refresh token (best practice)
    const { accessToken, refreshToken: newRefreshToken } = await (0, generateAccessTokenAndRefreshToken_1.generateAccessTokenAndRefreshToken)(user._id.toString());
    user.refreshToken = newRefreshToken;
    await user.save();
    res
        .cookie("accessToken", accessToken, cookieOptions_1.cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions_1.cookieOptions)
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { accessToken }, "Access token refreshed"));
});
//* ===============  Logout ===============
exports.logoutUser = (0, asyncHandler_1.default)(async (req, res) => {
    const authenticatedReq = req;
    await user_model_1.User.findByIdAndUpdate(authenticatedReq.user._id, {
        $set: { refreshToken: "" },
    });
    res
        .status(200)
        .clearCookie("accessToken", cookieOptions_1.cookieOptions)
        .clearCookie("refreshToken", cookieOptions_1.cookieOptions)
        .json(new ApiResponse_1.ApiResponse(200, {}, "User logged out successfully"));
});
exports.updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { fullName, email, otpCode } = req.body;
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    // If email is being changed, require OTP verification
    if (email && email !== user.email) {
        if (!otpCode) {
            throw new ApiError_1.ApiError(400, "Verification code is required to change email");
        }
        const trimmedOtp = otpCode.trim();
        if (!user.loginOtp ||
            !user.otpExpires ||
            user.loginOtp !== trimmedOtp ||
            user.otpExpires.getTime() < Date.now()) {
            throw new ApiError_1.ApiError(400, "Invalid or expired verification code");
        }
        // OTP valid → clear it
        user.loginOtp = undefined;
        user.otpExpires = undefined;
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    await user.save();
    const safeUser = await user_model_1.User.findById(user._id).select("-password -refreshToken");
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, safeUser, "Profile updated successfully"));
});
exports.updateAvatar = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const files = req.files;
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse_1.ApiResponse(404, null, "User not found"));
    }
    let avatar = "";
    if (files?.avatar?.[0]) {
        if (user.avatar)
            await file_service_1.fileService.deleteFile("account/avatar", user.avatar.split("/").pop());
        const f = files.avatar[0];
        const fileName = file_service_1.fileService.generateFileName(f.originalname, "avatar");
        await file_service_1.fileService.moveFile(f.path, "account/avatar", fileName);
        avatar = file_service_1.fileService.getFileUrl("account/avatar", fileName);
    }
    user.avatar = avatar;
    await user.save();
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, user, "Profile avatar updated successfully"));
});
exports.changePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { currentPassword, newPassword, otpCode } = req.body;
    const user = await user_model_1.User.findById(req.user._id);
    const trimmedOtp = (otpCode ?? "").trim();
    if (!user ||
        !user.loginOtp ||
        !user.otpExpires ||
        user.loginOtp !== trimmedOtp ||
        user.otpExpires.getTime() < Date.now()) {
        throw new ApiError_1.ApiError(400, "Invalid or expired OTP");
    }
    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch)
        throw new ApiError_1.ApiError(401, "Current password incorrect");
    user.password = newPassword;
    user.loginOtp = undefined; // Clear OTP after use
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Password updated"));
});
exports.toggleTwoStep = (0, asyncHandler_1.default)(async (req, res) => {
    const { enabled, otpCode } = req.body;
    const user = await user_model_1.User.findById(req.user._id);
    const trimmedOtp = (otpCode ?? "").trim();
    if (process.env.NODE_ENV === "development") {
        console.log(`[OTP Debug] stored=${user?.loginOtp} | received=${trimmedOtp}`);
    }
    // 1. Validate OTP
    if (!user ||
        !user.loginOtp ||
        !user.otpExpires ||
        user.loginOtp !== trimmedOtp ||
        user.otpExpires.getTime() < Date.now()) {
        throw new ApiError_1.ApiError(400, "Invalid or expired verification code");
    }
    // 2. Perform Action
    user.twoStepEnabled = enabled;
    user.loginOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json(new ApiResponse_1.ApiResponse(200, user, "Security setting updated"));
});
exports.updateTwoStepEmail = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { twoStepEmail, otpCode } = req.body;
    if (!twoStepEmail || !otpCode) {
        throw new ApiError_1.ApiError(400, "New email and verification code are required");
    }
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    // 1. Verify OTP match
    if (user.loginOtp !== otpCode) {
        throw new ApiError_1.ApiError(401, "Invalid verification code");
    }
    // 2. Check if OTP is expired
    if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
        throw new ApiError_1.ApiError(400, "Verification code has expired. Please request a new one.");
    }
    // 3. Update the email and clear OTP fields
    user.twoStepEmail = twoStepEmail;
    user.loginOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, user, "Secondary verification email updated successfully"));
});
exports.sendSecurityOTP = (0, asyncHandler_1.default)(async (req, res) => {
    const email = req.body.email;
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();
    // Fetch store name for store-branded email
    const store = user.storeId ? await store_model_1.Store.findById(user.storeId).select("name").lean() : null;
    await (0, gmailMailer_1.sendGmailMail)(user.twoStepEmail || user.email, "Security Verification Code", (0, templates_1.otpTemplate)(otp, store?.name));
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { sentTo: user.twoStepEmail || user.email }, "Verification code sent to email"));
});
