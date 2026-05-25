import mongoose, { Schema, model, Types } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

const SupportSchema = new Schema(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    name: String,
    email: String,
    phone: String,
    message: String,
  },
  { timestamps: true },
);

SupportSchema.plugin(storeIsolationPlugin);

export const support = mongoose.model("support", SupportSchema);
