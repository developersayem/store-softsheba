import { Request, Response, NextFunction } from "express";
import { getLicenseStatus } from "../services/heartbeat.service";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware to restrict write operations if the license is invalid.
 * This is a dedicated license project, so validation is always enforced.
 */
export const licenseGuard = (req: Request, res: Response, next: NextFunction) => {
  const { isValid, status } = getLicenseStatus();

  // If the license is active/valid, allow everything
  if (isValid && status === "active") {
    return next();
  }

  // Define write methods that should be blocked
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (writeMethods.includes(req.method)) {
    throw new ApiError(
      403,
      `Action restricted. Your license is currently ${status || "invalid"}. Please activate your license to perform this action.`
    );
  }

  next();
};
