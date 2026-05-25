"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantService = void 0;
// services/variant.service.ts
const mongoose_1 = require("mongoose");
const product_model_1 = require("../models/product.model");
const variant_model_1 = require("../models/variant.model");
const ApiError_1 = require("../utils/ApiError");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
exports.variantService = {
    // -------------------- CREATE Variant --------------------
    async create(payload) {
        const { productId, sku, attributes = [], regular_price = 0, purchase_price = 0, sale_price = 0, discount_type = null, discount = 0, image, stock = 0, stock_alert = 0, sold = 0, ratings = 0, status = "active", } = payload;
        console.log(payload);
        // Validate product ID
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new ApiError_1.ApiError(400, "Invalid product ID");
        }
        // Check product exists
        const product = await product_model_1.Product.findById(productId);
        if (!product) {
            throw new ApiError_1.ApiError(404, "Product not found");
        }
        // Create variant
        const variant = await variant_model_1.Variant.create({
            productId,
            sku,
            attributes,
            regular_price,
            purchase_price,
            sale_price,
            discount_type,
            discount,
            image,
            stock,
            stock_alert,
            sold,
            ratings,
            status,
        });
        // Attach variant ID to product.variants[]
        if (!product.variants.includes(variant._id)) {
            product.variants.push(variant._id);
            await product.save();
        }
        return (0, image_resolver_plugin_1.resolveImageUrls)(variant, ["image"]);
    },
    // -------------------- UPDATE Variant --------------------
    async update(id, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new ApiError_1.ApiError(400, "Invalid variant ID");
        }
        const updateData = { ...payload };
        console.log(payload, updateData);
        // Normalize attributes if provided
        if (payload.attributes) {
            updateData.attributes = payload.attributes.map((attr) => ({
                attributeId: attr.attributeId
                    ? new mongoose_1.Types.ObjectId(attr.attributeId)
                    : new mongoose_1.Types.ObjectId(attr.attribute),
                value: attr.value,
            }));
        }
        // Normalize image (singular string, not array)
        if (payload.image !== undefined) {
            updateData.image = payload.image;
        }
        const variant = await variant_model_1.Variant.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!variant) {
            throw new ApiError_1.ApiError(404, "Variant not found");
        }
        return (0, image_resolver_plugin_1.resolveImageUrls)(variant, ["image"]);
    },
    // -------------------- GET Variant --------------------
    async getById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new ApiError_1.ApiError(400, "Invalid variant ID");
        }
        const variant = await variant_model_1.Variant.findById(id)
            .populate("attributes.attributeId", "name values")
            .lean();
        if (!variant) {
            throw new ApiError_1.ApiError(404, "Variant not found");
        }
        return (0, image_resolver_plugin_1.resolveImageUrls)(variant, ["image"]);
    },
    // -------------------- DELETE Variant --------------------
    async delete(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new ApiError_1.ApiError(400, "Invalid variant ID");
        }
        const variant = await variant_model_1.Variant.findById(id);
        if (!variant) {
            throw new ApiError_1.ApiError(404, "Variant not found");
        }
        // Remove reference from product
        await product_model_1.Product.findByIdAndUpdate(variant.productId, {
            $pull: { variants: variant._id },
        });
        await variant_model_1.Variant.findByIdAndDelete(id);
        return { message: "Variant deleted" };
    },
    // -------------------- GET VARIANTS BY PRODUCT --------------------
    async getByProduct(productId) {
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new ApiError_1.ApiError(400, "Invalid product ID");
        }
        const variants = await variant_model_1.Variant.find({ productId })
            .populate("attributes.attributeId", "name values")
            .sort({ createdAt: -1 })
            .lean();
        return (0, image_resolver_plugin_1.resolveImageUrls)(variants, ["image"]);
    },
};
