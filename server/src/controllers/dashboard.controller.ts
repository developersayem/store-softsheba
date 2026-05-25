//dashboard.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import {
  getOverviewData,
  getProfitandLossDataByProductAndCategory,
  profitAndLossOverview,
} from "../services/dashboard.service";

export const getDashboardOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const { statuses, timeframe, frequency } = req.body;

    const data = await getOverviewData({
      statuses,
      timeframe,
      frequency,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Dashboard overview fetched"));
  },
);

export const getProfitaAndLossOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const { timeframe, statuses } = req.body;

    const data = await profitAndLossOverview(
      timeframe as string,
      statuses as string[],
    );

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Profit and loss overview fetched"));
  },
);

export const getDashboardProfit = asyncHandler(
  async (req: Request, res: Response) => {
    // const { timeframe } = req.body;

    const data = await getProfitandLossDataByProductAndCategory();

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Dashboard profit data fetched"));
  },
);

