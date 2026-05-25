import { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";

export const getSalesReport = async (_req: Request, res: Response) => {
  const data = await analyticsService.salesReport();
  res.json(data);
};

export const getInventoryReport = async (_req: Request, res: Response) => {
  const data = await analyticsService.inventoryReport();
  res.json(data);
};

export const getRevenueReport = async (_req: Request, res: Response) => {
  const data = await analyticsService.revenueReport();
  res.json(data);
};

export const getCustomerReport = async (_req: Request, res: Response) => {
  const data = await analyticsService.customerReport();
  res.json(data);
};
