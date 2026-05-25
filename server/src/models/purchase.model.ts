import mongoose, { Schema, model, Types, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IPurchaseItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  cost_price?: number;
}

export interface IPurchase extends Document {
  storeId: Types.ObjectId;
  supplierId: Types.ObjectId;
  items: IPurchaseItem[];
  status: "pending" | "received" | "cancelled";
  total_amount?: number;
  created_at?: Date;
  updated_at?: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
  quantity: { type: Number, required: true },
  cost_price: { type: Number, default: 0 },
});

const purchaseSchema = new Schema<IPurchase>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [purchaseItemSchema],
    status: { type: String, enum: ["pending", "received", "cancelled"], default: "pending" },
    total_amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

purchaseSchema.plugin(storeIsolationPlugin);

export const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
