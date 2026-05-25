import asyncHandler from "../utils/asyncHandler";
import { purchaseService } from "../services/purchase.service";
import { ApiResponse } from "../utils/ApiResponse";

export const createPurchase = asyncHandler(async (req, res) => {
  const data = await purchaseService.create(req.body);
  res.status(201).json(new ApiResponse(201, data, "Purchase created"));
});

export const updatePurchase = asyncHandler(async (req, res) => {
  const data = await purchaseService.update(req.params.id as string, req.body);
  res.json(new ApiResponse(200, data, "Purchase updated"));
});

export const deletePurchase = asyncHandler(async (req, res) => {
  const data = await purchaseService.delete(req.params.id as string);
  res.json(new ApiResponse(200, data));
});

export const getAllPurchases = asyncHandler(async (_req, res) => {
  const data = await purchaseService.getAll();
  res.json(new ApiResponse(200, data));
});

export const getPurchaseById = asyncHandler(async (req, res) => {
  const data = await purchaseService.getById(req.params.id as string);
  res.json(new ApiResponse(200, data));
});
