import { Inventory } from "../models/inventory.model";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";
import { Product } from "../models/product.model";
import { notificationService } from "./notification.service";
import { Variant } from "../models/variant.model";

export const inventoryService = {
  async getInventory(productId: string, variantId?: string) {
    if (!mongoose.Types.ObjectId.isValid(productId))
      throw new ApiError(400, "Invalid product ID");

    const query: any = { productId };
    if (variantId) {
      if (!mongoose.Types.ObjectId.isValid(variantId))
        throw new ApiError(400, "Invalid variant ID");
      query.variantId = variantId;
    }

    let inventory = await Inventory.findOne(query);
    if (!inventory) {
      inventory = await Inventory.create({
        ...query,
        quantity: 0,
        stock_alert: 0,
      });
    }

    return inventory;
  },

  async updateStock(
    productId: string,
    variantId: string | null,
    quantity: number
  ) {
    let entity: any;
    const product=await Product.findById(productId);
    if (variantId) {
      entity = await Variant.findById(variantId);
      if (!entity) throw new ApiError(404, "Variant not found");
    } else {
      entity = await Product.findById(productId);
      if (!entity) throw new ApiError(404, "Product not found");
    }

    const prevStock = entity.stock;
    const newStock = prevStock + quantity;

    if (newStock < 0) {
      throw new ApiError(400, "Stock cannot be negative");
    }

    entity.stock = newStock;
    await entity.save();
    //console.log(entity);

    // 🔔 LOW STOCK NOTIFICATION
    const alertLevel = entity.stock_alert ?? 0;

    if (newStock <= alertLevel) {
      await notificationService.createNotification({
        title: "Low Stock Alert",
        message: `Product-${product?.name} 
        ${entity.sku} stock is low (${newStock} left)`,
        productId:product?.slug,
        type: "warning",
      });
    }

    return entity;
    // const inventory = await this.getInventory(productId, variantId || undefined);
    // inventory.quantity += quantity;
    // inventory.updated_at = new Date();
    // await inventory.save();
    // return inventory;
  },

  async setStockAlert(
    productId: string,
    variantId: string | null,
    stock_alert: number
  ) {
    const inventory = await this.getInventory(
      productId,
      variantId || undefined
    );
    inventory.stock_alert = stock_alert;
    await inventory.save();
    return inventory;
  },

  async listAll() {
    return Inventory.find()
      .populate("productId", "name sku")
      .populate("variantId", "sku")
      .sort({ updated_at: -1 });
  },
};
