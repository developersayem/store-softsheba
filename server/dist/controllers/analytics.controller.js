"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerReport = exports.getRevenueReport = exports.getInventoryReport = exports.getSalesReport = void 0;
const analytics_service_1 = require("../services/analytics.service");
const getSalesReport = async (_req, res) => {
    const data = await analytics_service_1.analyticsService.salesReport();
    res.json(data);
};
exports.getSalesReport = getSalesReport;
const getInventoryReport = async (_req, res) => {
    const data = await analytics_service_1.analyticsService.inventoryReport();
    res.json(data);
};
exports.getInventoryReport = getInventoryReport;
const getRevenueReport = async (_req, res) => {
    const data = await analytics_service_1.analyticsService.revenueReport();
    res.json(data);
};
exports.getRevenueReport = getRevenueReport;
const getCustomerReport = async (_req, res) => {
    const data = await analytics_service_1.analyticsService.customerReport();
    res.json(data);
};
exports.getCustomerReport = getCustomerReport;
