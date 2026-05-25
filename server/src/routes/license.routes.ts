import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getLicenseStatus, syncLicense } from "../services/heartbeat.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const router = Router();

router.get("/status", asyncHandler(async (req, res) => {
  let status = getLicenseStatus() as any;
  
  // Auto-sync in background if invalid/expired and last sync was more than 10 seconds ago
  if (!status.isValid && (Date.now() - (status.lastSync || 0) > 10000)) {
    syncLicense().catch(err => console.error("Auto-sync background failed:", err.message));
  }
  
  return res.status(200).json(new ApiResponse(200, status, "License status fetched successfully"));
}));

router.post("/sync", verifyJWT, asyncHandler(async (req, res) => {
  await syncLicense();
  const status = getLicenseStatus();
  return res.status(200).json(new ApiResponse(200, status, "License synced successfully"));
}));

export default router;
