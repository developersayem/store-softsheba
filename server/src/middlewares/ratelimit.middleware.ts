import rateLimit from "express-rate-limit";
import { Request } from "express";

/**
 * Rate limiter for OTP/verification code endpoints.
 * Limits per IP to prevent brute-force attacks.
 */
export const sendCodeLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many resend attempts. Please try again later.",
});

/**
 * General API rate limiter with per-store isolation.
 * Keys by storeId + IP so one tenant's traffic can't
 * exhaust the rate limit for another tenant.
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 200, // 200 requests per minute per storeId+IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const storeId = (req as any).storeId?.toString() || "global";
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `${storeId}:${ip}`;
  },
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again later.",
  },
});

/**
 * Storefront-specific rate limiter (for public checkout/order endpoints).
 * More restrictive to prevent order spam or abuse.
 */
export const storefrontLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per storeId+IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const storeId = (req as any).storeId?.toString() || "global";
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `storefront:${storeId}:${ip}`;
  },
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
