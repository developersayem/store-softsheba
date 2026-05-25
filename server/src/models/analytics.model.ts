import mongoose, { Schema, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface ISalesReport extends Document {
  storeId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
  total_price: number;
  created_at: Date;
}

export interface IInventoryReport extends Document {
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  opening_stock: number;
  closing_stock: number;
  sold_quantity: number;
  updated_at: Date;
}

export interface IRevenueReport extends Document {
  storeId: mongoose.Types.ObjectId;
  date: Date;
  total_sales: number;
  total_discount: number;
  net_revenue: number;
  order_count: number;
}

export interface ICustomerReport extends Document {
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  total_orders: number;
  total_spent: number;
  last_order_date: Date;
}

const SalesReportSchema = new Schema<ISalesReport>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
    quantity: { type: Number, required: true },
    total_price: { type: Number, required: true },
  },
  { timestamps: { createdAt: "created_at" } }
);

const InventoryReportSchema = new Schema<IInventoryReport>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
    opening_stock: { type: Number, required: true },
    closing_stock: { type: Number, required: true },
    sold_quantity: { type: Number, required: true },
  },
  { timestamps: { updatedAt: "updated_at" } }
);

const RevenueReportSchema = new Schema<IRevenueReport>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    date: { type: Date, required: true },
    total_sales: { type: Number, required: true },
    total_discount: { type: Number, required: true },
    net_revenue: { type: Number, required: true },
    order_count: { type: Number, required: true },
  }
);

const CustomerReportSchema = new Schema<ICustomerReport>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    total_orders: { type: Number, required: true },
    total_spent: { type: Number, required: true },
    last_order_date: { type: Date, required: true },
  }
);

SalesReportSchema.plugin(storeIsolationPlugin);
InventoryReportSchema.plugin(storeIsolationPlugin);
RevenueReportSchema.plugin(storeIsolationPlugin);
CustomerReportSchema.plugin(storeIsolationPlugin);

export const SalesReport = mongoose.model<ISalesReport>("SalesReport", SalesReportSchema);
export const InventoryReport = mongoose.model<IInventoryReport>("InventoryReport", InventoryReportSchema);
export const RevenueReport = mongoose.model<IRevenueReport>("RevenueReport", RevenueReportSchema);
export const CustomerReport = mongoose.model<ICustomerReport>("CustomerReport", CustomerReportSchema);
