import { Schema, model, Types } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IReview {
  storeId: Types.ObjectId;
  product: Types.ObjectId;
  name: string;
  location?: string;
  email: string;
  rating: number;
  review: string;
  isApproved: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
      index: true 
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    email: { type: String, required: true, trim: true },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
      trim: true,
    },

    isApproved: {
      type: Boolean,
      default: false, //! IMPORTANT
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.plugin(storeIsolationPlugin);

export const Review = model<IReview>("Review", reviewSchema);
