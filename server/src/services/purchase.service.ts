import { Purchase } from "../models/purchase.model";
import { Supplier } from "../models/supplier.model";
import { Product } from "../models/product.model";
import { Variant } from "../models/variant.model";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";
import { inventoryService } from "./inventory.service"; // ← add this import

export const purchaseService = {
  async create(payload: any) {
    const { supplierId, items = [], status = "pending" } = payload;

    if (!mongoose.Types.ObjectId.isValid(supplierId))
      throw new ApiError(400, "Invalid supplier ID");

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new ApiError(404, "Supplier not found");

    let total_amount = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId))
        throw new ApiError(400, "Invalid product ID in items");

      const product = await Product.findById(item.productId);
      if (!product) throw new ApiError(404, "Product not found in items");

      if (item.variantId) {
        if (!mongoose.Types.ObjectId.isValid(item.variantId))
          throw new ApiError(400, "Invalid variant ID in items");

        const variant = await Variant.findById(item.variantId);
        if (!variant) throw new ApiError(404, "Variant not found in items");
      }

      total_amount += (item.cost_price || 0) * item.quantity;
    }

    const purchase = await Purchase.create({
      supplierId,
      items,
      status,
      total_amount,
    });

    // Update inventory immediately if status is received on creation
    if (status === "received") {
      for (const item of purchase.items) {
        await inventoryService.updateStock(
          item.productId.toString(),
          item.variantId?.toString() || null,
          item.quantity
        );
      }
    }

    return purchase;
  },

  async update(id: string, payload: any) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid purchase ID");

    const purchase = await Purchase.findById(id);
    if (!purchase) throw new ApiError(404, "Purchase not found");

    if (payload.items) {
      let total_amount = 0;

      for (const item of payload.items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new ApiError(404, "Product not found in items");

        if (item.variantId) {
          const variant = await Variant.findById(item.variantId);
          if (!variant) throw new ApiError(404, "Variant not found in items");
        }

        total_amount += (item.cost_price || 0) * item.quantity;
      }

      purchase.items = payload.items;
      purchase.total_amount = total_amount;
    }

    if (payload.status) purchase.status = payload.status;
    if (payload.supplierId) purchase.supplierId = payload.supplierId;

    await purchase.save();

    // Auto-update inventory when purchase is received
    if (payload.status === "received") {
      for (const item of purchase.items) {
        await inventoryService.updateStock(
          item.productId.toString(),
          item.variantId?.toString() || null,
          item.quantity
        );
      }
    }

    return purchase;
  },

  async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid purchase ID");

    const purchase = await Purchase.findByIdAndDelete(id);
    if (!purchase) throw new ApiError(404, "Purchase not found");

    return { message: "Purchase deleted" };
  },

  async getAll() {
    return Purchase.find()
      .populate("supplierId", "name email phone")
      .populate("items.productId", "name sku")
      .populate("items.variantId", "sku")
      .sort({ createdAt: -1 });
  },

  async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid purchase ID");

    const purchase = await Purchase.findById(id)
      .populate("supplierId", "name email phone")
      .populate("items.productId", "name sku")
      .populate("items.variantId", "sku");

    if (!purchase) throw new ApiError(404, "Purchase not found");
    return purchase;
  },
};
