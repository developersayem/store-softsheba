import { Request, Response } from "express";
import {
  getStoreSettingsService,
  updateStoreSettingsService,
} from "../services/store_settings.service";
import NodeCache from "node-cache";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const myCache = new NodeCache({ stdTTL: 15, checkperiod: 120 });

const CACHE_KEY = "STORE_SETTINGS_DATA";

export const getStoreSettings = async (req: Request, res: Response) => {
  try {
    // For single vendor, we use a global cache key
    const STORE_CACHE_KEY = CACHE_KEY;

    // Check if data is already in RAM
    const cachedData = myCache.get(STORE_CACHE_KEY);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");

    if (cachedData) {
      // If found, return immediately. No DB query needed.
      return res.status(200).json({
        success: true,
        data: cachedData,
        source: "cache",
      });
    }

    //  If NOT in cache, fetch from Database
    const settings = await getStoreSettingsService();

    // Save to Cache for next time
    myCache.set(STORE_CACHE_KEY, settings);

    res.status(200).json({
      success: true,
      data: settings,
      source: "database",
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
Update Store Settings
===================================================== */
export const updateStoreSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const updatedSettings = await updateStoreSettingsService(
      req.body,
      req.files as any
    );
    // For single vendor, we use a global cache key
    const STORE_CACHE_KEY = CACHE_KEY;
    myCache.del(STORE_CACHE_KEY);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedSettings,
          "Store settings updated successfully"
        )
      );
  }
);
