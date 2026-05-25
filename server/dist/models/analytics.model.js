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
exports.CustomerReport = exports.RevenueReport = exports.InventoryReport = exports.SalesReport = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const store_isolation_plugin_1 = require("../utils/store-isolation.plugin");
const SalesReportSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Variant" },
    quantity: { type: Number, required: true },
    total_price: { type: Number, required: true },
}, { timestamps: { createdAt: "created_at" } });
const InventoryReportSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Variant" },
    opening_stock: { type: Number, required: true },
    closing_stock: { type: Number, required: true },
    sold_quantity: { type: Number, required: true },
}, { timestamps: { updatedAt: "updated_at" } });
const RevenueReportSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    date: { type: Date, required: true },
    total_sales: { type: Number, required: true },
    total_discount: { type: Number, required: true },
    net_revenue: { type: Number, required: true },
    order_count: { type: Number, required: true },
});
const CustomerReportSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        index: true
    },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Customer", required: true },
    total_orders: { type: Number, required: true },
    total_spent: { type: Number, required: true },
    last_order_date: { type: Date, required: true },
});
SalesReportSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
InventoryReportSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
RevenueReportSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
CustomerReportSchema.plugin(store_isolation_plugin_1.storeIsolationPlugin);
exports.SalesReport = mongoose_1.default.model("SalesReport", SalesReportSchema);
exports.InventoryReport = mongoose_1.default.model("InventoryReport", InventoryReportSchema);
exports.RevenueReport = mongoose_1.default.model("RevenueReport", RevenueReportSchema);
exports.CustomerReport = mongoose_1.default.model("CustomerReport", CustomerReportSchema);
