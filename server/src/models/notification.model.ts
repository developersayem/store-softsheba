import mongoose, { Schema, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface INotification extends Document {
  storeId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  productId?: string;
  supportId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "support";
  isRead: boolean;
  read_at?: Date;
  created_at: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "support"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    read_at: { type: Date },
    productId: { type: String },
    supportId: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

NotificationSchema.plugin(storeIsolationPlugin);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
