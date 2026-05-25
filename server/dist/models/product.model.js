"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
// models/product.model.ts
const mongoose_1 = require("mongoose");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const productSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: {
        type: String,
        trim: true,
        set: (v) => (v === "" ? undefined : v),
    },
    categories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Category" }],
    collections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Collection" }],
    brand: { type: mongoose_1.Schema.Types.ObjectId, ref: "Brand", default: null },
    // control variants flow
    hasVariants: { type: Boolean, default: false },
    // Product attributes for products without variants
    productAttributes: {
        type: [
            {
                attributeId: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "Attribute",
                    required: true,
                },
                value: { type: String, required: true },
            },
        ],
        default: [],
        _id: false,
    },
    is_published: { type: Boolean, default: false },
    is_flash_sale: { type: Boolean, default: false },
    // thumbnail optional at schema level; enforce conditionally if you want
    thumbnail: { type: String, required: true },
    gallery: { type: [String], default: [] },
    variants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Variant" }],
    stock: { type: Number, default: 0, required: true },
    stock_alert: { type: Number, default: 0 },
    // Make regular_price optional at schema level; conditionally required if hasVariants=false
    regular_price: { type: Number, required: true, min: 0 },
    purchase_price: { type: Number, required: true, min: 0 },
    sale_price: { type: Number, required: true, min: 0 },
    discount_type: {
        type: String,
        enum: ["flat", "percentage"],
        default: null,
    },
    discount: { type: Number, default: 0, min: 0 },
    short_description: { type: String },
    long_description: { type: String },
    delivery: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ShippingRule",
        default: null,
    },
    is_free_shipping: { type: Boolean, default: false },
    is_digital_product: { type: Boolean, default: false },
    file: { type: String, default: null },
    meta_title: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    sold: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    publishedAt: { type: Date },
}, { timestamps: true });
productSchema.index({ storeId: 1 });
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index({ storeId: 1, sku: 1 }, {
    unique: true,
    partialFilterExpression: { sku: { $type: "string", $gt: "" } }
});
productSchema.plugin(image_resolver_plugin_1.imageResolver, {
    fields: ["thumbnail", "gallery", "file"],
});
productSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Product = (0, mongoose_1.model)("Product", productSchema);
