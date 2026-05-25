import asyncHandler from "../utils/asyncHandler";
import { supplierService } from "../services/supplier.service";
import { ApiResponse } from "../utils/ApiResponse";

export const createSupplier = asyncHandler(async (req, res) => {
  const data = await supplierService.create(req.body);
  res.status(201).json(new ApiResponse(201, data, "Supplier created"));
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const data = await supplierService.update(req.params.id as string, req.body);
  res.json(new ApiResponse(200, data, "Supplier updated"));
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const data = await supplierService.delete(req.params.id as string);
  res.json(new ApiResponse(200, data));
});

export const getAllSuppliers = asyncHandler(async (_req, res) => {
  const data = await supplierService.getAll();
  res.json(new ApiResponse(200, data));
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const data = await supplierService.getById(req.params.id as string);
  res.json(new ApiResponse(200, data));
});
