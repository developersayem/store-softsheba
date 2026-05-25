"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
const mongoose_1 = require("mongoose");
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const attributeSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    unit: { type: String, required: false },
    values: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
attributeSchema.index({ storeId: 1 });
attributeSchema.index({ storeId: 1, slug: 1 }, { unique: true });
attributeSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.Attribute = (0, mongoose_1.model)("Attribute", attributeSchema);
