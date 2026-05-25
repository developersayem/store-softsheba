import mongoose, { Schema } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

const CourierApiSchema = new Schema(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    // ================= Pathao =================
    pathao: {
      enabled: {
        type: Boolean,
        default: false,
      },

      clientId: {
        type: String,
        trim: true,
      },

      clientSecret: {
        type: String,
        trim: true,
      },

      clientEmail: {
        type: String,
        trim: true,
      },

      clientPassword: {
        type: String,
        trim: true,
      },

      storeId: {
        type: String,
        trim: true,
      },

      storeName: {
        type: String,
        trim: true,
      },

      storeContactNumber: {
        type: String,
        trim: true,
      },

      webhookCallbackUrl: {
        type: String,
        trim: true,
      },

      webhookSecret: {
        type: String,
        trim: true,
      },
    },

    // ================= SteadFast =================
    steadfast: {
      enabled: {
        type: Boolean,
        default: false,
      },

      apiKey: {
        type: String,
        trim: true,
      },

      secretKey: {
        type: String,
        trim: true,
      },
    },

    // ================= Carrybee =================
    carrybee: {
      enabled: {
        type: Boolean,
        default: false,
      },

      clientId: {
        type: String,
        trim: true,
      },

      clientSecret: {
        type: String,
        trim: true,
      },

      clientContext: {
        type: String,
        trim: true,
      },

      isSandbox: {
        type: Boolean,
        default: true,
      },

      storeId: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

CourierApiSchema.plugin(storeIsolationPlugin);

export const CourierApiIntegration = mongoose.model("CourierApiIntegration", CourierApiSchema);
