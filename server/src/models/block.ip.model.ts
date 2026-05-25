// models/blockedIP.model.ts
import mongoose, { Schema } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

const BlockedIPSchema = new Schema(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    ip: { type: String, required: true },
    reason: String,
    blockedFromOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true },
);

BlockedIPSchema.index({ storeId: 1 });
BlockedIPSchema.index({ storeId: 1, ip: 1 }, { unique: true });

BlockedIPSchema.plugin(storeIsolationPlugin);

export const BlockedIP = mongoose.model("BlockedIP", BlockedIPSchema);
