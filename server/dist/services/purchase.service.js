"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseService = void 0;
const purchase_model_1 = require("../models/purchase.model");
const supplier_model_1 = require("../models/supplier.model");
const product_model_1 = require("../models/product.model");
const variant_model_1 = require("../models/variant.model");
const ApiError_1 = require("../utils/ApiError");
const mongoose_1 = __importDefault(require("mongoose"));
const inventory_service_1 = require("./inventory.service"); // ← add this import
exports.purchaseService = {
    async create(payload) {
        const { supplierId, items = [], status = "pending" } = payload;
        if (!mongoose_1.default.Types.ObjectId.isValid(supplierId))
            throw new ApiError_1.ApiError(400, "Invalid supplier ID");
        const supplier = await supplier_model_1.Supplier.findById(supplierId);
        if (!supplier)
            throw new ApiError_1.ApiError(404, "Supplier not found");
        let total_amount = 0;
        for (const item of items) {
            if (!mongoose_1.default.Types.ObjectId.isValid(item.productId))
                throw new ApiError_1.ApiError(400, "Invalid product ID in items");
            const product = await product_model_1.Product.findById(item.productId);
            if (!product)
                throw new ApiError_1.ApiError(404, "Product not found in items");
            if (item.variantId) {
                if (!mongoose_1.default.Types.ObjectId.isValid(item.variantId))
                    throw new ApiError_1.ApiError(400, "Invalid variant ID in items");
                const variant = await variant_model_1.Variant.findById(item.variantId);
                if (!variant)
                    throw new ApiError_1.ApiError(404, "Variant not found in items");
            }
            total_amount += (item.cost_price || 0) * item.quantity;
        }
        const purchase = await purchase_model_1.Purchase.create({
            supplierId,
            items,
            status,
            total_amount,
        });
        // Update inventory immediately if status is received on creation
        if (status === "received") {
            for (const item of purchase.items) {
                await inventory_service_1.inventoryService.updateStock(item.productId.toString(), item.variantId?.toString() || null, item.quantity);
            }
        }
        return purchase;
    },
    async update(id, payload) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid purchase ID");
        const purchase = await purchase_model_1.Purchase.findById(id);
        if (!purchase)
            throw new ApiError_1.ApiError(404, "Purchase not found");
        if (payload.items) {
            let total_amount = 0;
            for (const item of payload.items) {
                const product = await product_model_1.Product.findById(item.productId);
                if (!product)
                    throw new ApiError_1.ApiError(404, "Product not found in items");
                if (item.variantId) {
                    const variant = await variant_model_1.Variant.findById(item.variantId);
                    if (!variant)
                        throw new ApiError_1.ApiError(404, "Variant not found in items");
                }
                total_amount += (item.cost_price || 0) * item.quantity;
            }
            purchase.items = payload.items;
            purchase.total_amount = total_amount;
        }
        if (payload.status)
            purchase.status = payload.status;
        if (payload.supplierId)
            purchase.supplierId = payload.supplierId;
        await purchase.save();
        // Auto-update inventory when purchase is received
        if (payload.status === "received") {
            for (const item of purchase.items) {
                await inventory_service_1.inventoryService.updateStock(item.productId.toString(), item.variantId?.toString() || null, item.quantity);
            }
        }
        return purchase;
    },
    async delete(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid purchase ID");
        const purchase = await purchase_model_1.Purchase.findByIdAndDelete(id);
        if (!purchase)
            throw new ApiError_1.ApiError(404, "Purchase not found");
        return { message: "Purchase deleted" };
    },
    async getAll() {
        return purchase_model_1.Purchase.find()
            .populate("supplierId", "name email phone")
            .populate("items.productId", "name sku")
            .populate("items.variantId", "sku")
            .sort({ createdAt: -1 });
    },
    async getById(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid purchase ID");
        const purchase = await purchase_model_1.Purchase.findById(id)
            .populate("supplierId", "name email phone")
            .populate("items.productId", "name sku")
            .populate("items.variantId", "sku");
        if (!purchase)
            throw new ApiError_1.ApiError(404, "Purchase not found");
        return purchase;
    },
};
