import type{ Request, Response, NextFunction } from "express";
import type{ JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import asyncHandler from "../utils/asyncHandler";
import dotenv from "dotenv";



dotenv.config();



import { IStore } from "../models/store.model";
import mongoose from "mongoose";

// Extend Request to include `user`, `storeId`, and `store`
export interface AuthenticatedRequest extends Request {
  user?: typeof User.prototype;
  storeId?: mongoose.Types.ObjectId;
  store?: IStore;
}

// Define token payload structure (customize if needed)
interface DecodedToken extends JwtPayload {
  _id: string;
  email: string;
}

export const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized - No token provided");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET as string
      ) as DecodedToken;

      const user = await User.findById(decoded._id).select("-password -refreshToken");

      if (!user) throw new ApiError(401, "Unauthorized - User not found");
      
      if (user.isActive === false) {
        throw new ApiError(403, "Your account has been restricted. Please contact the administrator.");
      }

      req.user = user;
      if (user.storeId) {
        (req as any).storeId = user.storeId;
      }
      next();
    } catch (error: any) {
        console.error("JWT verification error:", error);
      throw new ApiError(401, error.message || "Invalid access token");
    }
  }
);
