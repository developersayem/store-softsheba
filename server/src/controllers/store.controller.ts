import { Request, Response } from "express";
import { Store } from "../models/store.model";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
/**
 * Get current store details (License Level)
 */
export const getMyStore = asyncHandler(async (req: Request, res: Response) => {
  const storeId = (req as any).storeId;
  
  if (!storeId) {
    throw new ApiError(400, "Store context not found");
  }

  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError(404, "Store not found");
  }

  return res.status(200).json(
    new ApiResponse(200, store, "Store details fetched successfully")
  );
});

/**
 * Update custom domain for the current store
 */
export const updateCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const storeId = (req as any).storeId;
  const { domain } = req.body;

  if (!storeId) {
    throw new ApiError(400, "Store context not found");
  }

  // Basic validation
  if (domain) {
    const formattedDomain = domain.toLowerCase().trim();
    
    // Check if domain is already taken by another store
    const existing = await Store.findOne({ 
      domain: formattedDomain, 
      _id: { $ne: storeId } 
    });
    
    if (existing) {
      throw new ApiError(400, "This custom domain is already in use by another store");
    }

    // Prevent using system domains
    const host = req.headers.host || "";
    const baseDomain = host.split(":")[0];
    if (formattedDomain.endsWith(baseDomain)) {
      throw new ApiError(400, "Cannot use a subdomain of the platform as a custom domain. Use the store slug settings instead.");
    }
  }

  const store = await Store.findByIdAndUpdate(
    storeId,
    { domain: domain ? domain.toLowerCase().trim() : null },
    { new: true, runValidators: true }
  );

  if (!store) {
    throw new ApiError(404, "Store not found");
  }

  return res.status(200).json(
    new ApiResponse(200, store, "Custom domain updated successfully")
  );
});
