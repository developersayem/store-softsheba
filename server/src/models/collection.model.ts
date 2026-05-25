import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";
import { imageResolver } from "../utils/image-resolver.plugin";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface ICollection extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  products?: mongoose.Types.ObjectId[];
  category?: mongoose.Types.ObjectId[];
  isFeatured: boolean;
  isPublished: boolean;
  image?: string;
  order?: number;
  homeLimit?: number;
  sortBy?:
    | "latest"
    | "oldest"
    | "flash_sale"
    | "big_discount"
    | "high_price"
    | "low_price";
}

const CollectionSchema = new Schema<ICollection>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    image: { type: String },
    homeLimit: { type: Number, default: 12 },
    order: { type: Number },
    sortBy: {
      type: String,
      enum: [
        "latest",
        "oldest",
        "flash_sale",
        "big_discount",
        "high_price",
        "low_price",
      ],
      default: "latest",
    },
  },
  { timestamps: true }
);

CollectionSchema.index({ storeId: 1 });
CollectionSchema.index({ storeId: 1, name: 1 }, { unique: true });
CollectionSchema.index({ storeId: 1, slug: 1 }, { unique: true });

CollectionSchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    const Collection = mongoose.model<ICollection>(
      "Collection",
      CollectionSchema
    );

    let baseSlug = slugify(this.name, { lower: true, strict: true });
    if (!baseSlug) baseSlug = `collection-${Date.now()}`;

    let slug = baseSlug;
    let exists = await Collection.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });

    while (exists) {
      slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
      exists = await Collection.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });
    }

    this.slug = slug;
  }
  next();
});

CollectionSchema.plugin(imageResolver, { fields: ["image"] });
CollectionSchema.plugin(storeIsolationPlugin);

export const Collection = mongoose.model<ICollection>(
  "Collection",
  CollectionSchema
);
