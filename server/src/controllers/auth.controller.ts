import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { generateAccessTokenAndRefreshToken } from "../helper/generateAccessTokenAndRefreshToken";
import { cookieOptions } from "../utils/cookieOptions";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { sendGmailMail } from "../email/gmailMailer";
import { otpTemplate } from "../email/templates";
import { fileService } from "../services/utils/file.service";
import { resolveImageUrls } from "../utils/image-resolver.plugin";
import { Store } from "../models/store.model";

interface UploadedFiles {
  avatar: Express.Multer.File[];
}

//* =============== Get Current User ===============
export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;

    const user = await User.findById(authenticatedReq.user._id)
      .select("-password -refreshToken -loginOtp -otpExpires")
      .populate("storeId");

    if (!user) {
      return res.status(404).json(new ApiResponse(404, {}, "User not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resolveImageUrls(user, ["avatar"]), "Current user fetched successfully"));
  },
);

//* =============== Admin Login (Step 1: Send OTP) ===============
export const adminLoginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
      throw new ApiError(400, "Email and password are required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    if (user.isActive === false) {
      throw new ApiError(403, "Your account has been restricted. Please contact the administrator.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    if (user.twoStepEnabled) {
      // --- Scenario A: 2FA is ON (Send OTP) ---
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.loginOtp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save();

      // Fetch store name for store-branded email
      const store = user.storeId ? await Store.findById(user.storeId).select("name").lean() : null;

      const subject = "Your Verification Code";
      await sendGmailMail(
        user.twoStepEmail ? user.twoStepEmail : user.email,
        subject,
        otpTemplate(otp, store?.name),
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            twoStepEnabled: true,
            email: user.twoStepEmail ? user.twoStepEmail : user.email,
          },
          "OTP sent to your email",
        ),
      );
    } else {
      // --- Scenario B: 2FA is OFF (Direct Login) ---
      const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id.toString());

      user.refreshToken = refreshToken;
      await user.save();

      const safeUser = await User.findById(user._id)
        .select("-password -refreshToken -loginOtp -otpExpires")
        .populate("storeId");

      return res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .status(200)
        .json(
          new ApiResponse(
            200,
            { accessToken, user: safeUser },
            "Login successful",
          ),
        );
    }
  },
);

//* =============== Verify OTP (Step 2: Complete Login) ===============
export const verifyOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code } = req.body;

    if (!email || !code) throw new ApiError(400, "Email and OTP are required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    if (!user.loginOtp || !user.otpExpires) {
      throw new ApiError(400, "No OTP found. Please request a new one");
    }

    if (user.otpExpires.getTime() < Date.now()) {
      throw new ApiError(400, "OTP has expired");
    }

    if (user.loginOtp !== code) {
      throw new ApiError(401, "Invalid OTP");
    }

    // OTP valid → clear it and issue tokens
    user.loginOtp = undefined;
    user.otpExpires = undefined;

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    const safeUser = await User.findById(user._id)
      .select("-password -refreshToken")
      .populate("storeId");

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, user: safeUser },
          "Login successful",
        ),
      );
  },
);

//* ===============  Refresh Access Token ===============
export const refreshAccessTokenController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, "No refresh token");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById((decoded as any)._id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.isActive === false) {
    throw new ApiError(403, "Your account has been restricted. Please contact the administrator.");
  }

  // Rotate refresh token (best practice)
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessTokenAndRefreshToken(user._id.toString());

  user.refreshToken = newRefreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

//* ===============  Logout ===============
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;

  await User.findByIdAndUpdate(authenticatedReq.user._id, {
    $set: { refreshToken: "" },
  });

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user._id;
  const { fullName, email, otpCode } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If email is being changed, require OTP verification
  if (email && email !== user.email) {
    if (!otpCode) {
      throw new ApiError(400, "Verification code is required to change email");
    }

    const trimmedOtp = otpCode.trim();
    if (
      !user.loginOtp ||
      !user.otpExpires ||
      user.loginOtp !== trimmedOtp ||
      user.otpExpires.getTime() < Date.now()
    ) {
      throw new ApiError(400, "Invalid or expired verification code");
    }

    // OTP valid → clear it
    user.loginOtp = undefined;
    user.otpExpires = undefined;
  }

  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  await user.save();

  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, safeUser, "Profile updated successfully"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user._id;
  const files = req.files as unknown as UploadedFiles;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  let avatar = "";

  if (files?.avatar?.[0]) {
    if (user.avatar)
      await fileService.deleteFile(
        "account/avatar",
        user.avatar.split("/").pop()!,
      );
    const f = files.avatar[0];
    const fileName = fileService.generateFileName(f.originalname, "avatar");
    await fileService.moveFile(f.path, "account/avatar", fileName);
    avatar = fileService.getFileUrl("account/avatar", fileName);
  }
  user.avatar = avatar;
  await user.save();
  
  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile avatar updated successfully"));
});

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword, otpCode } = req.body;
    const user = await User.findById((req as AuthenticatedRequest).user._id);

    const trimmedOtp = (otpCode ?? "").trim();

    if (
      !user ||
      !user.loginOtp ||
      !user.otpExpires ||
      user.loginOtp !== trimmedOtp ||
      user.otpExpires.getTime() < Date.now()
    ) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) throw new ApiError(401, "Current password incorrect");

    user.password = newPassword;
    user.loginOtp = undefined; // Clear OTP after use
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, "Password updated"));
  },
);

export const toggleTwoStep = asyncHandler(async (req, res) => {
  const { enabled, otpCode } = req.body;
  const user = await User.findById((req as AuthenticatedRequest).user._id);

  const trimmedOtp = (otpCode ?? "").trim();

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[OTP Debug] stored=${user?.loginOtp} | received=${trimmedOtp}`,
    );
  }

  // 1. Validate OTP
  if (
    !user ||
    !user.loginOtp ||
    !user.otpExpires ||
    user.loginOtp !== trimmedOtp ||
    user.otpExpires.getTime() < Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // 2. Perform Action
  user.twoStepEnabled = enabled;
  user.loginOtp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, "Security setting updated"));
});

export const updateTwoStepEmail = asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user._id;
  const { twoStepEmail, otpCode } = req.body;

  if (!twoStepEmail || !otpCode) {
    throw new ApiError(400, "New email and verification code are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 1. Verify OTP match
  if (user.loginOtp !== otpCode) {
    throw new ApiError(401, "Invalid verification code");
  }

  // 2. Check if OTP is expired
  if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
    throw new ApiError(
      400,
      "Verification code has expired. Please request a new one.",
    );
  }

  // 3. Update the email and clear OTP fields
  user.twoStepEmail = twoStepEmail;
  user.loginOtp = undefined;
  user.otpExpires = undefined;

  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Secondary verification email updated successfully",
      ),
    );
});

export const sendSecurityOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    // Fetch store name for store-branded email
    const store = user.storeId ? await Store.findById(user.storeId).select("name").lean() : null;

    await sendGmailMail(
      user.twoStepEmail || user.email,
      "Security Verification Code",
      otpTemplate(otp, store?.name),
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { sentTo: user.twoStepEmail || user.email },
          "Verification code sent to email",
        ),
      );
  },
);
