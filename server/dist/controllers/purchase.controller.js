"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPurchaseById = exports.getAllPurchases = exports.deletePurchase = exports.updatePurchase = exports.createPurchase = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const purchase_service_1 = require("../services/purchase.service");
const ApiResponse_1 = require("../utils/ApiResponse");
exports.createPurchase = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await purchase_service_1.purchaseService.create(req.body);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, data, "Purchase created"));
});
exports.updatePurchase = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await purchase_service_1.purchaseService.update(req.params.id, req.body);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Purchase updated"));
});
exports.deletePurchase = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await purchase_service_1.purchaseService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getAllPurchases = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await purchase_service_1.purchaseService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getPurchaseById = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await purchase_service_1.purchaseService.getById(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
