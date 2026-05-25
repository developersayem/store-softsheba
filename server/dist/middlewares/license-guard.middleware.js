"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseGuard = void 0;
const heartbeat_service_1 = require("../services/heartbeat.service");
const ApiError_1 = require("../utils/ApiError");
/**
 * Middleware to restrict write operations if the license is invalid.
 * This is a dedicated license project, so validation is always enforced.
 */
const licenseGuard = (req, res, next) => {
    const { isValid, status } = (0, heartbeat_service_1.getLicenseStatus)();
    // If the license is active/valid, allow everything
    if (isValid && status === "active") {
        return next();
    }
    // Define write methods that should be blocked
    const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (writeMethods.includes(req.method)) {
        throw new ApiError_1.ApiError(403, `Action restricted. Your license is currently ${status || "invalid"}. Please activate your license to perform this action.`);
    }
    next();
};
exports.licenseGuard = licenseGuard;
