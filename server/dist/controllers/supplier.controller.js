"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupplierById = exports.getAllSuppliers = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const supplier_service_1 = require("../services/supplier.service");
const ApiResponse_1 = require("../utils/ApiResponse");
exports.createSupplier = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await supplier_service_1.supplierService.create(req.body);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, data, "Supplier created"));
});
exports.updateSupplier = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await supplier_service_1.supplierService.update(req.params.id, req.body);
    res.json(new ApiResponse_1.ApiResponse(200, data, "Supplier updated"));
});
exports.deleteSupplier = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await supplier_service_1.supplierService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getAllSuppliers = (0, asyncHandler_1.default)(async (_req, res) => {
    const data = await supplier_service_1.supplierService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
exports.getSupplierById = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await supplier_service_1.supplierService.getById(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, data));
});
