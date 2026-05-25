"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomDomain = exports.getMyStore = void 0;
const store_model_1 = require("../models/store.model");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
/**
 * Get current store details (License Level)
 */
exports.getMyStore = (0, asyncHandler_1.default)(async (req, res) => {
    const storeId = req.storeId;
    if (!storeId) {
        throw new ApiError_1.ApiError(400, "Store context not found");
    }
    const store = await store_model_1.Store.findById(storeId);
    if (!store) {
        throw new ApiError_1.ApiError(404, "Store not found");
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, store, "Store details fetched successfully"));
});
/**
 * Update custom domain for the current store
 */
exports.updateCustomDomain = (0, asyncHandler_1.default)(async (req, res) => {
    const storeId = req.storeId;
    const { domain } = req.body;
    if (!storeId) {
        throw new ApiError_1.ApiError(400, "Store context not found");
    }
    // Basic validation
    if (domain) {
        const formattedDomain = domain.toLowerCase().trim();
        // Check if domain is already taken by another store
        const existing = await store_model_1.Store.findOne({
            domain: formattedDomain,
            _id: { $ne: storeId }
        });
        if (existing) {
            throw new ApiError_1.ApiError(400, "This custom domain is already in use by another store");
        }
        // Prevent using system domains
        const host = req.headers.host || "";
        const baseDomain = host.split(":")[0];
        if (formattedDomain.endsWith(baseDomain)) {
            throw new ApiError_1.ApiError(400, "Cannot use a subdomain of the platform as a custom domain. Use the store slug settings instead.");
        }
    }
    const store = await store_model_1.Store.findByIdAndUpdate(storeId, { domain: domain ? domain.toLowerCase().trim() : null }, { new: true, runValidators: true });
    if (!store) {
        throw new ApiError_1.ApiError(404, "Store not found");
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, store, "Custom domain updated successfully"));
});
