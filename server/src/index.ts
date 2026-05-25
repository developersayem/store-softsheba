import dotenv from "dotenv";
import connectDB from "./db/index";
import logger from "./utils/logger";
import { app } from "./app";
import asyncHandler from "./utils/asyncHandler";
import { ApiResponse } from "./utils/ApiResponse";
import type { Request, Response } from "express";
import SowingSeed from "./db/seed/index";

import http from "http";

import { initSocket } from "./socket";

dotenv.config({
  path: "./.env",
});

// Health check route
app.use(
  "/api/v1/health-check",
  asyncHandler(async (req: Request, res: Response) => {
    res
      .status(200)
      .json(
        new ApiResponse(200, "API Server is running", "Health check Passed")
      );
  })
);

// Fallback for 404
app.use((req, res) => {
  res
    .status(404)
    .json({ message: "Requested resource could not be found. 😐" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // sowing all seeds
    await SowingSeed();
    const server = http.createServer(app);

    initSocket(server);

    // Start the server
    server.listen(PORT, () => {
      console.log(`\n  Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  });

// Handle uncaught exceptions and unhandled rejections
// This is important for production to avoid silent failures
// and to log errors properly.
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});
