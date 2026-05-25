import asyncHandler from "../utils/asyncHandler";
import { inventoryService } from "../services/inventory.service";
import { ApiResponse } from "../utils/ApiResponse";

export const getInventory = asyncHandler(async (req, res) => {
  const data = await inventoryService.getInventory(
    req.params.productId as string,
    req.params.variantId as string
  );
  res.json(new ApiResponse(200, data));
});

export const updateStock = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  const data = await inventoryService.updateStock(
    productId,
    variantId || null,
    Number(quantity)
  );
  res.json(new ApiResponse(200, data, "Stock updated"));
});

export const setStockAlert = asyncHandler(async (req, res) => {
  const { productId, variantId, stock_alert } = req.body;
  const data = await inventoryService.setStockAlert(
    productId,
    variantId || null,
    Number(stock_alert)
  );
  res.json(new ApiResponse(200, data, "Stock alert updated"));
});

export const listInventory = asyncHandler(async (_req, res) => {
  const data = await inventoryService.listAll();
  res.json(new ApiResponse(200, data));
});
