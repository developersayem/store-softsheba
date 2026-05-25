"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const analytics_model_1 = require("../models/analytics.model");
exports.analyticsService = {
    async salesReport() {
        return analytics_model_1.SalesReport.find().populate("orderId").populate("productId").populate("variantId").lean();
    },
    async inventoryReport() {
        return analytics_model_1.InventoryReport.find().populate("productId").populate("variantId").lean();
    },
    async revenueReport() {
        return analytics_model_1.RevenueReport.find().lean();
    },
    async customerReport() {
        return analytics_model_1.CustomerReport.find().populate("customerId").lean();
    },
};
