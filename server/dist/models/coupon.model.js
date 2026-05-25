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
exports.CouponUsage = exports.Coupon = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const CouponSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    code: { type: String, required: true },
    discount_type: { type: String, enum: ["flat", "percentage"], required: true },
    discount: { type: Number, required: true },
    min_purchase: { type: Number },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
CouponSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
CouponSchema.index({ storeId: 1 });
CouponSchema.index({ storeId: 1, code: 1 }, { unique: true });
const CouponUsageSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
    },
    couponId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Coupon", required: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    used_at: { type: Date, default: Date.now },
}, { timestamps: true });
CouponUsageSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
CouponUsageSchema.index({ storeId: 1 });
exports.Coupon = mongoose_1.default.model("Coupon", CouponSchema);
exports.CouponUsage = mongoose_1.default.model("CouponUsage", CouponUsageSchema);
