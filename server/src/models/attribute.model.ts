import { Schema, model, Types } from "mongoose";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IAttribute {
  _id?: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  slug: string;
  unit?: string;
  values: string[];
  isActive: boolean;
}

const attributeSchema = new Schema<IAttribute>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    unit: { type: String, required: false },
    values: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

attributeSchema.index({ storeId: 1 });
attributeSchema.index({ storeId: 1, slug: 1 }, { unique: true });

attributeSchema.plugin(storeIsolationPlugin);

export const Attribute = model<IAttribute>("Attribute", attributeSchema);
