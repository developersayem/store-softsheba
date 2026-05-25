"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingRule = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const WeightRangeSchema = new mongoose_1.Schema({
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    charge: { type: Number, required: true },
});
const ShippingAreaSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ["flat_rate", "free_shipping", "rate_by_weight"],
        required: true,
    },
    amount: { type: Number }, // required if type is flat_rate
    weight_ranges: { type: [WeightRangeSchema], default: [] }, // required if type is rate_by_weight
    extra_per_kg: { type: Number, default: 0 },
});
const ShippingRuleSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    name: { type: String, required: true },
    areas: {
        type: [ShippingAreaSchema],
        required: true,
        validate: [
            (arr) => arr.length > 0,
            "At least one area is required",
        ],
    },
    active: { type: Boolean, default: true },
}, { timestamps: true });
ShippingRuleSchema.index({ storeId: 1 });
ShippingRuleSchema.index({ storeId: 1, name: 1 }, { unique: true });
ShippingRuleSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.ShippingRule = mongoose_1.default.model("ShippingRule", ShippingRuleSchema);
