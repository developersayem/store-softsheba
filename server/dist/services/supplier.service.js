"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierService = void 0;
const supplier_model_1 = require("../models/supplier.model");
const ApiError_1 = require("../utils/ApiError");
const mongoose_1 = __importDefault(require("mongoose"));
exports.supplierService = {
    async create(payload) {
        const existing = await supplier_model_1.Supplier.findOne({ name: payload.name });
        if (existing)
            throw new ApiError_1.ApiError(400, "Supplier already exists");
        const supplier = await supplier_model_1.Supplier.create(payload);
        return supplier;
    },
    async update(id, payload) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid supplier ID");
        const supplier = await supplier_model_1.Supplier.findById(id);
        if (!supplier)
            throw new ApiError_1.ApiError(404, "Supplier not found");
        Object.assign(supplier, payload);
        await supplier.save();
        return supplier;
    },
    async delete(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid supplier ID");
        const supplier = await supplier_model_1.Supplier.findByIdAndDelete(id);
        if (!supplier)
            throw new ApiError_1.ApiError(404, "Supplier not found");
        return { message: "Supplier deleted" };
    },
    async getAll() {
        return supplier_model_1.Supplier.find().sort({ createdAt: -1 });
    },
    async getById(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid supplier ID");
        const supplier = await supplier_model_1.Supplier.findById(id);
        if (!supplier)
            throw new ApiError_1.ApiError(404, "Supplier not found");
        return supplier;
    },
};
