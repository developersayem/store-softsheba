// services/variant.service.ts
import { Types } from "mongoose";
import { Product } from "../models/product.model";
import { Variant, IVariant } from "../models/variant.model";
import { ApiError } from "../utils/ApiError";
import { resolveImageUrls } from "../utils/image-resolver.plugin";

export const variantService = {
  // -------------------- CREATE Variant --------------------
  async create(payload: any) {
    const {
      productId,
      sku,
      attributes = [],
      regular_price = 0,
      purchase_price = 0,
      sale_price = 0,
      discount_type = null,
      discount = 0,
      image,
      stock = 0,
      stock_alert = 0,
      sold = 0,
      ratings = 0,
      status = "active",
    } = payload;
    console.log(payload)

    // Validate product ID
    if (!Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product ID");
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Create variant
    const variant = await Variant.create({
      productId,
      sku,
      attributes,
      regular_price,
      purchase_price,
      sale_price,
      discount_type,
      discount,
      image,
      stock,
      stock_alert,
      sold,
      ratings,
      status,
    });

    // Attach variant ID to product.variants[]
    if (!product.variants.includes(variant._id)) {
      product.variants.push(variant._id);
      await product.save();
    }

    return resolveImageUrls(variant, ["image"]);
  },

  // -------------------- UPDATE Variant --------------------
  async update(id: string, payload: Partial<IVariant>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid variant ID");
    }

    const updateData: any = { ...payload };
    console.log(payload,updateData)

    // Normalize attributes if provided
    if (payload.attributes) {
      updateData.attributes = payload.attributes.map((attr: any) => ({
        attributeId: attr.attributeId
          ? new Types.ObjectId(attr.attributeId)
          : new Types.ObjectId(attr.attribute),
        value: attr.value,
      }));
    }

    // Normalize image (singular string, not array)
    if (payload.image !== undefined) {
      updateData.image = payload.image;
    }

    const variant = await Variant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!variant) {
      throw new ApiError(404, "Variant not found");
    }

    return resolveImageUrls(variant, ["image"]);
  },
  // -------------------- GET Variant --------------------
  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid variant ID");
    }

    const variant = await Variant.findById(id)
      .populate("attributes.attributeId", "name values")
      .lean();

    if (!variant) {
      throw new ApiError(404, "Variant not found");
    }

    return resolveImageUrls(variant, ["image"]);
  },

  // -------------------- DELETE Variant --------------------
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid variant ID");
    }

    const variant = await Variant.findById(id);
    if (!variant) {
      throw new ApiError(404, "Variant not found");
    }

    // Remove reference from product
    await Product.findByIdAndUpdate(variant.productId, {
      $pull: { variants: variant._id },
    });

    await Variant.findByIdAndDelete(id);

    return { message: "Variant deleted" };
  },

  // -------------------- GET VARIANTS BY PRODUCT --------------------
  async getByProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product ID");
    }

    const variants = await Variant.find({ productId })
      .populate("attributes.attributeId", "name values")
      .sort({ createdAt: -1 })
      .lean();

    return resolveImageUrls(variants, ["image"]);
  },
};
