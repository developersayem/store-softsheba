import mongoose, { Schema, Document, model } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface INote extends Document {
  author: string;
  content: string;
  createdAt: Date;
}

export interface ICustomer extends Document {
  storeId: mongoose.Types.ObjectId;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  note?: string;
  nextCall?: Date;
  postal_code?: string;
  isBlocked: boolean;
  blocked_reason?: string;
  groupNames?: string[];
  noteHistory?: INote[];
  created_at: Date;
  updated_at: Date;
}

const NoteSchema = new Schema(
  {
    author: { type: String, required: true },
    content: { type: String, required: true },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    note: { type: String },
    nextCall: { type: Date },
    postal_code: { type: String },
    isBlocked: { type: Boolean, default: false },
    blocked_reason: { type: String },
    groupNames: { type: [String], default: [] },
    noteHistory: [NoteSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

CustomerSchema.index({ storeId: 1 });
CustomerSchema.index({ storeId: 1, phone: 1 }, { unique: true });

// Use a partial index for email to allow multiple customers with NO email (null/missing)
// while still ensuring uniqueness when an email IS provided.
CustomerSchema.index(
  { storeId: 1, email: 1 }, 
  { 
    unique: true, 
    // Only include in index if email is a non-empty string
    partialFilterExpression: { email: { $gt: "" } } 
  }
);

CustomerSchema.plugin(storeIsolationPlugin);

export const Customer = model<ICustomer>("Customer", CustomerSchema);
