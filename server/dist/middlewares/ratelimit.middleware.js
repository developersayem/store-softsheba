"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontLimiter = exports.apiLimiter = exports.sendCodeLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate limiter for OTP/verification code endpoints.
 * Limits per IP to prevent brute-force attacks.
 */
exports.sendCodeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many resend attempts. Please try again later.",
});
/**
 * General API rate limiter with per-store isolation.
 * Keys by storeId + IP so one tenant's traffic can't
 * exhaust the rate limit for another tenant.
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 200, // 200 requests per minute per storeId+IP
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const storeId = req.storeId?.toString() || "global";
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
exports.storefrontLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute per storeId+IP
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const storeId = req.storeId?.toString() || "global";
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        return `storefront:${storeId}:${ip}`;
    },
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});
