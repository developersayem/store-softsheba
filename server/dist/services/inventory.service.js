"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryService = void 0;
const inventory_model_1 = require("../models/inventory.model");
const ApiError_1 = require("../utils/ApiError");
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = require("../models/product.model");
const notification_service_1 = require("./notification.service");
const variant_model_1 = require("../models/variant.model");
exports.inventoryService = {
    async getInventory(productId, variantId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(productId))
            throw new ApiError_1.ApiError(400, "Invalid product ID");
        const query = { productId };
        if (variantId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(variantId))
                throw new ApiError_1.ApiError(400, "Invalid variant ID");
            query.variantId = variantId;
        }
        let inventory = await inventory_model_1.Inventory.findOne(query);
        if (!inventory) {
            inventory = await inventory_model_1.Inventory.create({
                ...query,
                quantity: 0,
                stock_alert: 0,
            });
        }
        return inventory;
    },
    async updateStock(productId, variantId, quantity) {
        let entity;
        const product = await product_model_1.Product.findById(productId);
        if (variantId) {
            entity = await variant_model_1.Variant.findById(variantId);
            if (!entity)
                throw new ApiError_1.ApiError(404, "Variant not found");
        }
        else {
            entity = await product_model_1.Product.findById(productId);
            if (!entity)
                throw new ApiError_1.ApiError(404, "Product not found");
        }
        const prevStock = entity.stock;
        const newStock = prevStock + quantity;
        if (newStock < 0) {
            throw new ApiError_1.ApiError(400, "Stock cannot be negative");
        }
        entity.stock = newStock;
        await entity.save();
        //console.log(entity);
        // 🔔 LOW STOCK NOTIFICATION
        const alertLevel = entity.stock_alert ?? 0;
        if (newStock <= alertLevel) {
            await notification_service_1.notificationService.createNotification({
                title: "Low Stock Alert",
                message: `Product-${product?.name} 
        ${entity.sku} stock is low (${newStock} left)`,
                productId: product?.slug,
                type: "warning",
            });
        }
        return entity;
        // const inventory = await this.getInventory(productId, variantId || undefined);
        // inventory.quantity += quantity;
        // inventory.updated_at = new Date();
        // await inventory.save();
        // return inventory;
    },
    async setStockAlert(productId, variantId, stock_alert) {
        const inventory = await this.getInventory(productId, variantId || undefined);
        inventory.stock_alert = stock_alert;
        await inventory.save();
        return inventory;
    },
    async listAll() {
        return inventory_model_1.Inventory.find()
            .populate("productId", "name sku")
            .populate("variantId", "sku")
            .sort({ updated_at: -1 });
    },
};
