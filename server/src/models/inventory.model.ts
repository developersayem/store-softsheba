import { Schema, model, Types, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IInventory extends Document {
  storeId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  stock_alert: number;
  updated_at?: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
    quantity: { type: Number, default: 0 },
    stock_alert: { type: Number, default: 0 },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inventorySchema.plugin(storeIsolationPlugin);

export const Inventory = model<IInventory>("Inventory", inventorySchema);
