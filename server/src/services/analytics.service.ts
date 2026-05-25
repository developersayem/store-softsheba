import { SalesReport, InventoryReport, RevenueReport, CustomerReport } from "../models/analytics.model";

export const analyticsService = {
  async salesReport() {
    return SalesReport.find().populate("orderId").populate("productId").populate("variantId").lean();
  },

  async inventoryReport() {
    return InventoryReport.find().populate("productId").populate("variantId").lean();
  },

  async revenueReport() {
    return RevenueReport.find().lean();
  },

  async customerReport() {
    return CustomerReport.find().populate("customerId").lean();
  },
};
