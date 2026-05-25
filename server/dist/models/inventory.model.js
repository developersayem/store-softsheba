"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const mongoose_1 = require("mongoose");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const inventorySchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Variant" },
    quantity: { type: Number, default: 0 },
    stock_alert: { type: Number, default: 0 },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true });
inventorySchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Inventory = (0, mongoose_1.model)("Inventory", inventorySchema);
