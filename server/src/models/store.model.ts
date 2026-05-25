import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStore extends Document {
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  favicon?: string;
  status: "active" | "suspended" | "maintenance";
  plan: "basic" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    logo: String,
    favicon: String,
    status: {
      type: String,
      enum: ["active", "suspended", "maintenance"],
      default: "active",
    },
    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise"],
      default: "basic",
    },
  },
  { timestamps: true }
);

// Index is already created via 'unique: true' in the schema definition.

export const Store = mongoose.model<IStore>("Store", StoreSchema);
