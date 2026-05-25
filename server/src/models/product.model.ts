// models/product.model.ts
import { Schema, model, Types } from "mongoose";
import { imageResolver } from "../utils/image-resolver.plugin";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IProductAttribute {
  attributeId: Types.ObjectId;
  value: string;
}

export interface IProduct {
  _id?: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  slug: string;
  sku?: string | null;
  categories: Types.ObjectId[];
  collections: Types.ObjectId[];
  brand: Types.ObjectId | null;
  is_published: boolean;
  is_flash_sale: boolean;
  thumbnail?: string | null;
  gallery: string[];
  variants: Types.ObjectId[];
  hasVariants: boolean;
  productAttributes: IProductAttribute[];
  stock: number;
  stock_alert: number;
  purchase_price?: number | null;
  sale_price: number;
  regular_price?: number | null;
  discount_type: "flat" | "percentage" | null;
  discount: number;
  short_description: string;
  long_description: string;
  delivery: Types.ObjectId | null;
  is_free_shipping: boolean;
  is_digital_product: boolean;
  file: string | null;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  tags: string[];
  sold: number;
  ratings: number;
  publishedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },

    sku: {
      type: String,
      trim: true,
      set: (v: string) => (v === "" ? undefined : v),
    },

    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    brand: { type: Schema.Types.ObjectId, ref: "Brand", default: null },

    // control variants flow
    hasVariants: { type: Boolean, default: false },

    // Product attributes for products without variants
    productAttributes: {
      type: [
        {
          attributeId: {
            type: Schema.Types.ObjectId,
            ref: "Attribute",
            required: true,
          },
          value: { type: String, required: true },
        },
      ],
      default: [],
      _id: false,
    },

    is_published: { type: Boolean, default: false },
    is_flash_sale: { type: Boolean, default: false },

    // thumbnail optional at schema level; enforce conditionally if you want
    thumbnail: { type: String, required: true },

    gallery: { type: [String], default: [] },

    variants: [{ type: Schema.Types.ObjectId, ref: "Variant" }],

    stock: { type: Number, default: 0, required: true },
    stock_alert: { type: Number, default: 0 },

    // Make regular_price optional at schema level; conditionally required if hasVariants=false
    regular_price: { type: Number, required: true, min: 0 },
    purchase_price: { type: Number, required: true, min: 0 },
    sale_price: { type: Number, required: true, min: 0 },
    discount_type: {
      type: String,
      enum: ["flat", "percentage"],
      default: null,
    },
    discount: { type: Number, default: 0, min: 0 },

    short_description: { type: String },
    long_description: { type: String },

    delivery: {
      type: Schema.Types.ObjectId,
      ref: "ShippingRule",
      default: null,
    },
    is_free_shipping: { type: Boolean, default: false },
    is_digital_product: { type: Boolean, default: false },
    file: { type: String, default: null },

    meta_title: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    tags: { type: [String], default: [] },

    sold: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

productSchema.index({ storeId: 1 });
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index(
  { storeId: 1, sku: 1 },
  { 
    unique: true, 
    partialFilterExpression: { sku: { $type: "string", $gt: "" } } 
  }
);

productSchema.plugin(imageResolver, {
  fields: ["thumbnail", "gallery", "file"],
});
productSchema.plugin(storeIsolationPlugin);

export const Product = model<IProduct>("Product", productSchema);
