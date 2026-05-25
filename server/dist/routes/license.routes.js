"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const heartbeat_service_1 = require("../services/heartbeat.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.get("/status", (0, asyncHandler_1.default)(async (req, res) => {
    let status = (0, heartbeat_service_1.getLicenseStatus)();
    // Auto-sync in background if invalid/expired and last sync was more than 10 seconds ago
    if (!status.isValid && (Date.now() - (status.lastSync || 0) > 10000)) {
        (0, heartbeat_service_1.syncLicense)().catch(err => console.error("Auto-sync background failed:", err.message));
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, status, "License status fetched successfully"));
}));
router.post("/sync", auth_middleware_1.verifyJWT, (0, asyncHandler_1.default)(async (req, res) => {
    await (0, heartbeat_service_1.syncLicense)();
    const status = (0, heartbeat_service_1.getLicenseStatus)();
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, status, "License synced successfully"));
}));
exports.default = router;
