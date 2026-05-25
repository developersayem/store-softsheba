// models/variant.model.ts
import { Schema, model, Types } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";
import { imageResolver } from "../utils/image-resolver.plugin";

// Embedded schema for Variant attributes
export interface IVariantAttribute {
  attributeId: Types.ObjectId;
  value: string;
}

const variantAttributeSchema = new Schema<IVariantAttribute>(
  {
    attributeId: {
      type: Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
    value: { type: String, required: true },
  },
  { _id: false },
);

export interface IVariant {
  _id?: Types.ObjectId;
  storeId: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  attributes: IVariantAttribute[];
  sale_price: number;
  regular_price: number;
  purchase_price: number;
  discount_type: "flat" | "percentage" | null;
  discount: number;

  // SINGLE image (string)
  image: string;

  stock: number;
  stock_alert: number;
  sold: number;
  ratings: number;
  status: "active" | "inactive";
}

const variantSchema = new Schema<IVariant>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      trim: true,
      set: (v: string) => (v === "" ? undefined : v),
    },

    attributes: {
      type: [variantAttributeSchema],
      default: [],
      required: true,
    },
    sale_price: { type: Number, required: true, min: 0 },
    regular_price: { type: Number, required: true, min: 0 },
    purchase_price: { type: Number, required: true, min: 0 },
    discount_type: {
      type: String,
      enum: ["flat", "percentage", null],
      default: null,
    },
    discount: { type: Number, default: 0, min: 0 },

    // SINGLE IMAGE
    image: { type: String, default: "" },

    stock: { type: Number, default: 0, min: 0, required: true },
    stock_alert: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    ratings: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true },
);

variantSchema.index({ storeId: 1 });
variantSchema.index(
  { storeId: 1, sku: 1 },
  { 
    unique: true, 
    partialFilterExpression: { sku: { $type: "string", $gt: "" } } 
  }
);

variantSchema.plugin(imageResolver, { fields: ["image"] });

variantSchema.plugin(storeIsolationPlugin);

export const Variant = model<IVariant>("Variant", variantSchema);
