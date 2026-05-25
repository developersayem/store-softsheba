import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

/**
 * List all staff members for the current store.
 */
export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const storeId = (req as any).storeId;
  
  if (!storeId) {
    throw new ApiError(400, "Store identification failed");
  }

  const staff = await User.find({ 
    role: "staff" 
  }).select("-password -refreshToken -loginOtp -otpExpires");

  return res.status(200).json(
    new ApiResponse(200, staff, "Staff members fetched successfully")
  );
});

/**
 * Create a new staff member.
 */
export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, permissions, phoneNumber, address } = req.body;
  const storeId = (req as any).storeId;

  if (!storeId) {
    throw new ApiError(400, "Store identification failed");
  }

  if (!fullName || !email || !password) {
    throw new ApiError(400, "Full name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const newStaff = await User.create({
    fullName,
    email,
    password,
    storeId,
    role: "staff",
    permissions: permissions || [],
    phoneNumber: phoneNumber || null,
    address: address || null,
  });

  const safeStaff = await User.findById(newStaff._id).select("-password -refreshToken -loginOtp -otpExpires");

  return res.status(201).json(
    new ApiResponse(201, safeStaff, "Staff member created successfully")
  );
});

/**
 * Update staff permissions and status.
 */
export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, permissions, isActive, phoneNumber, address } = req.body;

  const staff = await User.findById(id);

  if (!staff || staff.role !== "staff") {
    throw new ApiError(404, "Staff member not found");
  }

  if (fullName) staff.fullName = fullName;
  if (permissions) staff.permissions = permissions;
  if (isActive !== undefined) staff.isActive = isActive;
  if (phoneNumber !== undefined) staff.phoneNumber = phoneNumber;
  if (address !== undefined) staff.address = address;

  await staff.save();

  const updatedStaff = await User.findById(id).select("-password -refreshToken -loginOtp -otpExpires");

  return res.status(200).json(
    new ApiResponse(200, updatedStaff, "Staff member updated successfully")
  );
});

/**
 * Get a single staff member by ID.
 */
export const getSingleStaff = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const staff = await User.findById(id).select("-password -refreshToken -loginOtp -otpExpires");

  if (!staff || staff.role !== "staff") {
    throw new ApiError(404, "Staff member not found");
  }

  return res.status(200).json(
    new ApiResponse(200, staff, "Staff member fetched successfully")
  );
});

/**
 * Delete a staff member.
 */
export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const staff = await User.findById(id);

  if (!staff || staff.role !== "staff") {
    throw new ApiError(404, "Staff member not found");
  }

  await User.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Staff member deleted successfully")
  );
});
