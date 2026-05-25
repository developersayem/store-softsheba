import mongoose, { Schema, model, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface ISupplier extends Document {
  storeId: Schema.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  isActive: boolean;
  note?: string;
}

const supplierSchema = new Schema<ISupplier>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String },
    company: { type: String },
    isActive: { type: Boolean, default: true },
    note: { type: String },
  },
  { timestamps: true }
);

supplierSchema.index({ storeId: 1 });
supplierSchema.index({ storeId: 1, phone: 1 }, { unique: true, sparse: true });
supplierSchema.index({ storeId: 1, email: 1 }, { unique: true, sparse: true });

supplierSchema.plugin(storeIsolationPlugin);

export const Supplier = mongoose.model<ISupplier>("Supplier", supplierSchema);
