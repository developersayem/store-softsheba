"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaff = exports.getSingleStaff = exports.updateStaff = exports.createStaff = exports.getStaff = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const user_model_1 = require("../models/user.model");
/**
 * List all staff members for the current store.
 */
exports.getStaff = (0, asyncHandler_1.default)(async (req, res) => {
    const storeId = req.storeId;
    if (!storeId) {
        throw new ApiError_1.ApiError(400, "Store identification failed");
    }
    const staff = await user_model_1.User.find({
        role: "staff"
    }).select("-password -refreshToken -loginOtp -otpExpires");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, staff, "Staff members fetched successfully"));
});
/**
 * Create a new staff member.
 */
exports.createStaff = (0, asyncHandler_1.default)(async (req, res) => {
    const { fullName, email, password, permissions, phoneNumber, address } = req.body;
    const storeId = req.storeId;
    if (!storeId) {
        throw new ApiError_1.ApiError(400, "Store identification failed");
    }
    if (!fullName || !email || !password) {
        throw new ApiError_1.ApiError(400, "Full name, email and password are required");
    }
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new ApiError_1.ApiError(400, "User with this email already exists");
    }
    const newStaff = await user_model_1.User.create({
        fullName,
        email,
        password,
        storeId,
        role: "staff",
        permissions: permissions || [],
        phoneNumber: phoneNumber || null,
        address: address || null,
    });
    const safeStaff = await user_model_1.User.findById(newStaff._id).select("-password -refreshToken -loginOtp -otpExpires");
    return res.status(201).json(new ApiResponse_1.ApiResponse(201, safeStaff, "Staff member created successfully"));
});
/**
 * Update staff permissions and status.
 */
exports.updateStaff = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { fullName, permissions, isActive, phoneNumber, address } = req.body;
    const staff = await user_model_1.User.findById(id);
    if (!staff || staff.role !== "staff") {
        throw new ApiError_1.ApiError(404, "Staff member not found");
    }
    if (fullName)
        staff.fullName = fullName;
    if (permissions)
        staff.permissions = permissions;
    if (isActive !== undefined)
        staff.isActive = isActive;
    if (phoneNumber !== undefined)
        staff.phoneNumber = phoneNumber;
    if (address !== undefined)
        staff.address = address;
    await staff.save();
    const updatedStaff = await user_model_1.User.findById(id).select("-password -refreshToken -loginOtp -otpExpires");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, updatedStaff, "Staff member updated successfully"));
});
/**
 * Get a single staff member by ID.
 */
exports.getSingleStaff = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const staff = await user_model_1.User.findById(id).select("-password -refreshToken -loginOtp -otpExpires");
    if (!staff || staff.role !== "staff") {
        throw new ApiError_1.ApiError(404, "Staff member not found");
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, staff, "Staff member fetched successfully"));
});
/**
 * Delete a staff member.
 */
exports.deleteStaff = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const staff = await user_model_1.User.findById(id);
    if (!staff || staff.role !== "staff") {
        throw new ApiError_1.ApiError(404, "Staff member not found");
    }
    await user_model_1.User.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Staff member deleted successfully"));
});
