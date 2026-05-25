"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variant = void 0;
// models/variant.model.ts
const mongoose_1 = require("mongoose");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const variantAttributeSchema = new mongoose_1.Schema({
    attributeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Attribute",
        required: true,
    },
    value: { type: String, required: true },
}, { _id: false });
const variantSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sku: {
        type: String,
        trim: true,
        set: (v) => (v === "" ? undefined : v),
    },
    attributes: {
        type: [variantAttributeSchema],
        default: [],
        required: true,
    },
    sale_price: { type: Number, required: true, min: 0 },
    regular_price: { type: Number, required: true, min: 0 },
    purchase_price: { type: Number, required: true, min: 0 },
    discount_type: {
        type: String,
        enum: ["flat", "percentage", null],
        default: null,
    },
    discount: { type: Number, default: 0, min: 0 },
    // SINGLE IMAGE
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0, required: true },
    stock_alert: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    ratings: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        required: true,
    },
}, { timestamps: true });
variantSchema.index({ storeId: 1 });
variantSchema.index({ storeId: 1, sku: 1 }, {
    unique: true,
    partialFilterExpression: { sku: { $type: "string", $gt: "" } }
});
variantSchema.plugin(image_resolver_plugin_1.imageResolver, { fields: ["image"] });
variantSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Variant = (0, mongoose_1.model)("Variant", variantSchema);
