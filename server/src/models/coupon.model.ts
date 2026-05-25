import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface ICoupon extends Document {
  storeId: mongoose.Types.ObjectId;
  code: string;
  discount_type: "flat" | "percentage";
  discount: number;
  min_purchase?: number;
  start_date: Date;
  end_date: Date;
  products: ObjectId[];
  isActive: boolean;
}

export interface ICouponUsage extends Document {
  storeId: mongoose.Types.ObjectId;
  couponId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  productId: ObjectId;
  used_at: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    code: { type: String, required: true },
    discount_type: { type: String, enum: ["flat", "percentage"], required: true },
    discount: { type: Number, required: true },
    min_purchase: { type: Number },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.plugin(storeIsolationPlugin);

CouponSchema.index({ storeId: 1 });
CouponSchema.index({ storeId: 1, code: 1 }, { unique: true });

const CouponUsageSchema = new Schema<ICouponUsage>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    used_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CouponUsageSchema.plugin(storeIsolationPlugin);

CouponUsageSchema.index({ storeId: 1 });

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
export const CouponUsage = mongoose.model<ICouponUsage>("CouponUsage", CouponUsageSchema);
