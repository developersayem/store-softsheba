"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInventory = exports.setStockAlert = exports.updateStock = exports.getInventory = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const inventory_service_1 = require("../services/inventory.service");
const ApiResponse_1 = require("../utils/ApiResponse");
exports.getInventory = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await inventory_service_1.inventoryService.getInventory(req.params.productId, req.params.variantId);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.updateStock = (0, asyncHandler_1.default)(async (req, res) => {
    const { productId, variantId, quantity } = req.body;
    const data = await inventory_service_1.inventoryService.updateStock(productId, variantId || null, Number(quantity));
    res.json(new ApiResponse_1.ApiResponse(200, data, "Stock updated"));
});
exports.setStockAlert = (0, asyncHandler_1.default)(async (req, res) => {
    const { productId, variantId, stock_alert } = req.body;
    const data = await inventory_service_1.inventoryService.setStockAlert(productId, variantId || null, Number(stock_alert));
    res.json(new ApiResponse_1.ApiResponse(200, data, "Stock alert updated"));
});
exports.listInventory = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await inventory_service_1.inventoryService.listAll();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
