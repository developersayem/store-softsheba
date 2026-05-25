import { BlockedIP } from "../models/block.ip.model";
import type { Request, Response, NextFunction } from "express";

export const blockIPMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;

  if (!ip) return next();

  const blocked = await BlockedIP.findOne({ ip }).lean();
  if (blocked) {
    return res.status(403).json({
      success: false,
      message: "Your IP has been blocked",
    });
  }

  next();
};
