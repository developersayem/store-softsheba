import dotenv from "dotenv";
dotenv.config();

/**
 * Storage Configuration for ShopXet
 * Forced to Local Disk Storage with Image Optimization.
 */
export const storageConfig = {
  provider: "local",

  // Image Optimization Settings
  optimization: {
    enabled: true, // Always enabled for space efficiency
    quality: parseInt(process.env.IMAGE_QUALITY || "75"), // Default to 75 for better compression
    maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || "1200"),
    format: "webp" as const,
  },
};

console.log(`📦 Storage Configuration Loaded: [LOCAL] (Image Optimization: ${storageConfig.optimization.enabled})`);

