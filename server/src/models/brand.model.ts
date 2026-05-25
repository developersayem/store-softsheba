import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";
import { imageResolver } from "../utils/image-resolver.plugin";
import { storeIsolationPlugin } from "../utils/store-isolation.plugin";

export interface IBrand extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  isFeatured: boolean;
  isPublished: boolean;
}

const BrandSchema = new Schema<IBrand>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: "Store", 
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    image: { type: String },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BrandSchema.index({ storeId: 1 });
BrandSchema.index({ storeId: 1, name: 1 }, { unique: true });
BrandSchema.index({ storeId: 1, slug: 1 }, { unique: true });

BrandSchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;

    // fallback for empty or invalid names
    if (!slug) slug = `brand-${Date.now()}`;

    // check uniqueness
    const Brand = mongoose.model<IBrand>("Brand", BrandSchema);
    let exists = await Brand.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });
    while (exists) {
      // append random 4-character hex string
      slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
      exists = await Brand.findOne({ storeId: this.storeId, slug, _id: { $ne: this._id } });
    }

    this.slug = slug;
  }
  next();
});

BrandSchema.plugin(imageResolver, { fields: ["image"] });
BrandSchema.plugin(storeIsolationPlugin);

export const Brand = mongoose.model<IBrand>("Brand", BrandSchema);
