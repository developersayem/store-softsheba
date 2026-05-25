import mongoose, { Schema, model, Types, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

const MarketingSchema = new Schema(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    // ================= Facebook Conversion API =================
    facebook: {
      pixelId: {
        type: String,
        trim: true,
      },

      accessToken: {
        type: String,
        trim: true,
      },

      catalogId: {
        type: String,
        trim: true,
      },

      testEventCode: {
        type: String,
        trim: true,
      },

      browserTrackingEnabled: {
        type: Boolean,
        default: false,
      },

      serverTrackingEnabled: {
        type: Boolean,
        default: false,
      },
    },

    // ================= Google Tag Manager & Analytics =================
    google: {
      measurementId: {
        type: String,
        trim: true,
      },

      tagId: {
        type: String,
        trim: true,
      },

      merchant: {
        type: String,
        trim: true,
      },

      testEventCode: {
        type: String,
        trim: true,
      },

      analyticsIntegration: {
        type: String,
        trim: true,
      },
    },

    // ================= SEO Settings =================
    seo: {
      homePageTitle: {
        type: String,
        trim: true,
      },

      metaDescription: {
        type: String,
        trim: true,
      },

      metaKeywords: {
        type: String,
        trim: true,
      },

      domain: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true },
);

MarketingSchema.plugin(storeIsolationPlugin);

export const MarketingSettings = mongoose.model("MarketingSettings", MarketingSchema);
