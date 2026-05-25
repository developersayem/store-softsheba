import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { marketingService } from "../services/marketing.service";

export const getFacebookPixel = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await marketingService.getFacebookPixelData();
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Facebbok details fetched"));
  },
);
export const getGoogleConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await marketingService.getGoogleData();
    return res
      .status(200)
      .json(new ApiResponse(200, data, "GTM & GA4 details fetched"));
  },
);
export const getSeoConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await marketingService.getSeoData();
    return res
      .status(200)
      .json(new ApiResponse(200, data, "SEO details fetched"));
  },
);

export const getMarketing = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await marketingService.getMarketing();
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Marketing details fetched"));
  },
);

export const updateMarketing = asyncHandler(
  async (req: Request, res: Response) => {
    const courierApi = await marketingService.updateMarketing(req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, courierApi, "Marketing details updated"));
  },
);
