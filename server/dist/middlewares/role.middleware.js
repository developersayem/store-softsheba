"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwner = exports.checkPermission = void 0;
const ApiError_1 = require("../utils/ApiError");
/**
 * Middleware to check if the user has a specific permission.
 * Owners bypass all permission checks.
 */
const checkPermission = (permission) => {
    return (req, _, next) => {
        const user = req.user;
        if (!user) {
            throw new ApiError_1.ApiError(401, "Unauthorized");
        }
        // Owners have all permissions
        if (user.role === "owner") {
            return next();
        }
        // Check if staff has the specific permission
        if (user.permissions && user.permissions.includes(permission)) {
            return next();
        }
        throw new ApiError_1.ApiError(403, `Forbidden - Missing permission: ${permission}`);
    };
};
exports.checkPermission = checkPermission;
/**
 * Middleware to check if the user is an owner.
 */
const isOwner = (req, _, next) => {
    if (req.user?.role !== "owner") {
        throw new ApiError_1.ApiError(403, "Forbidden - Only owners can perform this action");
    }
    next();
};
exports.isOwner = isOwner;
