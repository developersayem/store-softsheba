import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";
import { imageResolver } from "../utils/image-resolver.plugin";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface ICategory extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | null;
  icon: string;
  banner?: string;
  isFeatured: boolean;
  isPublished: boolean;
  order?: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    icon: { type: String },
    banner: { type: String },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    order: { type: Number }
  },
  { timestamps: true }
);

CategorySchema.index({ storeId: 1 });
CategorySchema.index({ storeId: 1, name: 1 }, { unique: true });
CategorySchema.index({ storeId: 1, slug: 1 }, { unique: true });

CategorySchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    const Category = mongoose.model<ICategory>("Category", CategorySchema);

    let baseSlug = slugify(this.name, { lower: true, strict: true });
    if (!baseSlug) baseSlug = `category-${Date.now()}`;

    let slug = baseSlug;
    let exists = await Category.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });

    while (exists) {
      slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
      exists = await Category.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });
    }

    this.slug = slug;
  }
  next();
});

CategorySchema.plugin(imageResolver, { fields: ["icon", "banner"] });
CategorySchema.plugin(storeIsolationPlugin);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
