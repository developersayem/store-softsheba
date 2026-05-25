"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Storage Configuration for ShopXet
 * Forced to Local Disk Storage with Image Optimization.
 */
exports.storageConfig = {
    provider: "local",
    // Image Optimization Settings
    optimization: {
        enabled: true, // Always enabled for space efficiency
        quality: parseInt(process.env.IMAGE_QUALITY || "75"), // Default to 75 for better compression
        maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || "1200"),
        format: "webp",
    },
};
console.log(`📦 Storage Configuration Loaded: [LOCAL] (Image Optimization: ${exports.storageConfig.optimization.enabled})`);
