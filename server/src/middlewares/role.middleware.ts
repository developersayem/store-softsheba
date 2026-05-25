import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware to check if the user has a specific permission.
 * Owners bypass all permission checks.
 */
export const checkPermission = (permission: string) => {
  return (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // Owners have all permissions
    if (user.role === "owner") {
      return next();
    }

    // Check if staff has the specific permission
    if (user.permissions && user.permissions.includes(permission)) {
      return next();
    }

    throw new ApiError(403, `Forbidden - Missing permission: ${permission}`);
  };
};

/**
 * Middleware to check if the user is an owner.
 */
export const isOwner = (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
  if (req.user?.role !== "owner") {
    throw new ApiError(403, "Forbidden - Only owners can perform this action");
  }
  next();
};
