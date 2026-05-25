import mongoose, { Schema, model, Types, Document } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IWeightRange {
  min: number;
  max: number;
  charge: number;
}

export interface IShippingArea {
  name: string;
  type: "flat_rate" | "free_shipping" | "rate_by_weight";
  amount?: number; // for flat_rate
  weight_ranges?: IWeightRange[]; // for rate_by_weight
  extra_per_kg?: number; // for rate_by_weight (when exceeding max range)
}

export interface IShippingRule extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  areas: IShippingArea[];
  active: boolean;
}

const WeightRangeSchema = new Schema<IWeightRange>({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  charge: { type: Number, required: true },
});

const ShippingAreaSchema = new Schema<IShippingArea>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["flat_rate", "free_shipping", "rate_by_weight"],
    required: true,
  },
  amount: { type: Number }, // required if type is flat_rate
  weight_ranges: { type: [WeightRangeSchema], default: [] }, // required if type is rate_by_weight
  extra_per_kg: { type: Number, default: 0 },
});

const ShippingRuleSchema = new Schema<IShippingRule>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    name: { type: String, required: true },
    areas: {
      type: [ShippingAreaSchema],
      required: true,
      validate: [
        (arr: IShippingArea[]) => arr.length > 0,
        "At least one area is required",
      ],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ShippingRuleSchema.index({ storeId: 1 });
ShippingRuleSchema.index({ storeId: 1, name: 1 }, { unique: true });

ShippingRuleSchema.plugin(storeIsolationPlugin);

export const ShippingRule = mongoose.model<IShippingRule>(
  "ShippingRule",
  ShippingRuleSchema
);
