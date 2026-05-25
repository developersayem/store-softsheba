// services/product.service.ts
import mongoose, { Types } from "mongoose";
import { Product } from "../models/product.model";
import { Variant } from "../models/variant.model";
import { ApiError } from "../utils/ApiError";
import { buildProductPipeline } from "./pipelines/buildProduct.pipeline";
import { Brand } from "../models/brand.model";
import { Category } from "../models/category.model";
import { Collection, ICollection } from "../models/collection.model";
import { resolveImageUrls } from "../utils/image-resolver.plugin";
import { fileService } from "./utils/file.service";

export interface CreateProductPayload {
  name: string;
  sku: string;
  slug?: string;
  regular_price: number;
  purchase_price: number;
  sale_price: number;
  discount_type?: "flat" | "percentage" | null;
  discount?: number;
  short_description?: string;
  long_description?: string;
  category?: string[] | Types.ObjectId[];
  brand?: string | Types.ObjectId | null;
  attributes?: string[] | Types.ObjectId[];
  delivery?: string | Types.ObjectId | null;
  is_free_shipping?: boolean;
  is_digital_product?: boolean;
  is_published?: boolean;
  gallery?: string[];
  thumbnail: string;
  stock_alert?: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  tags?: string[];
  sold?: number;
  ratings?: number;
  file?: string;
  hasVariants?: boolean;
  is_flash_sale?: boolean;
  variants?: any[];
  stock?: number;
  categories?: Types.ObjectId[];
  collections?: Types.ObjectId[];
  productAttributes?: { attributeId: string; value: string }[];
}
function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
export const productService = {
  // -------------------- CREATE PRODUCT --------------------
  async createProduct(payload: CreateProductPayload) {
    if (!payload.name) throw new ApiError(400, "Product name is required");
    console.log(payload);

    const doc = await Product.create({
      ...payload,
      thumbnail: payload.thumbnail || "",
      attributes: payload.attributes || [],
      variants: [],
      gallery: payload.gallery || [],
    });

    if (payload.collections?.length) {
      await Collection.updateMany(
        { _id: { $in: payload.collections } },
        { $addToSet: { products: doc._id } },
      );
    }

    return doc;
  },
  // -------------------- UPDATE PRODUCT --------------------
  async updateProduct(id: string, payload: Partial<CreateProductPayload>) {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    // Capture old collections for synchronization
    const oldCollections = product.collections?.map((c) => c.toString()) || [];

    // List of fields allowed to update
    const updatable: (keyof CreateProductPayload)[] = [
      "name",
      "slug",
      "sku",
      "categories",
      "collections",
      "brand",
      "hasVariants",
      "is_published",
      "is_flash_sale",
      "thumbnail",
      "gallery",
      "stock",
      "stock_alert",
      "regular_price",
      "purchase_price",
      "sale_price",
      "discount_type",
      "discount",
      "short_description",
      "long_description",
      "delivery",
      "is_digital_product",
      "file",
      "meta_title",
      "meta_description",
      "keywords",
      "tags",
      "sold",
      "ratings",
      "is_free_shipping",
      "productAttributes",
    ];

    updatable.forEach((field) => {
      if (payload[field] !== undefined) {
        (product as any)[field] = payload[field];
      }
    });

    await product.save();

    // Synchronize collections
    if (payload.collections !== undefined) {
      const newCollections = payload.collections.map((c) => c.toString());

      // Collections to remove the product from
      const removed = oldCollections.filter((c) => !newCollections.includes(c));
      if (removed.length > 0) {
        await Collection.updateMany(
          { _id: { $in: removed } },
          { $pull: { products: product._id } },
        );
      }

      // Collections to add the product to
      const added = newCollections.filter((c) => !oldCollections.includes(c));
      if (added.length > 0) {
        await Collection.updateMany(
          { _id: { $in: added } },
          { $addToSet: { products: product._id } },
        );
      }
    }

    // Physical file cleanup
    const oldThumbnail = product.thumbnail;
    const oldGallery = product.gallery || [];

    // 1. Thumbnail cleanup
    if (
      payload.thumbnail !== undefined &&
      oldThumbnail &&
      oldThumbnail !== payload.thumbnail &&
      !oldThumbnail.includes("placeholder.png")
    ) {
      const thumbFile = oldThumbnail.split("/").pop();
      if (thumbFile) await fileService.deleteFile("products", thumbFile);
    }

    // 2. Gallery cleanup
    if (payload.gallery !== undefined) {
      const newGallery = payload.gallery || [];
      const galleryToDelete = oldGallery.filter(
        (img) => !newGallery.includes(img) && !img.includes("placeholder.png"),
      );

      for (const img of galleryToDelete) {
        const file = img.split("/").pop();
        if (file) await fileService.deleteFile("products", file);
      }
    }

    return product;
  },
  // -------------------- DELETE PRODUCT --------------------
  async deleteProduct(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid product id");

    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    // 1. Physical file cleanup for variants
    const variants = await Variant.find({ productId: product._id });
    for (const v of variants) {
      if (v.image && !v.image.includes("placeholder.png")) {
        const file = v.image.split("/").pop();
        if (file) await fileService.deleteFile("products", file);
      }
    }
    // Cascade delete variants
    await Variant.deleteMany({ productId: product._id });

    // 2. Physical file cleanup for product
    if (product.thumbnail && !product.thumbnail.includes("placeholder.png")) {
      const thumbFile = product.thumbnail.split("/").pop();
      if (thumbFile) await fileService.deleteFile("products", thumbFile);
    }

    if (product.gallery && product.gallery.length > 0) {
      for (const img of product.gallery) {
        if (!img.includes("placeholder.png")) {
          const file = img.split("/").pop();
          if (file) await fileService.deleteFile("products", file);
        }
      }
    }

    // 3. Delete product record
    const result = await Product.findByIdAndDelete(id);
    return result;
  },

  // -------------------- GET PRODUCT BY ID --------------------
  async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid product id");

    const { pipeline } = buildProductPipeline({}, false, {
      _id: new mongoose.Types.ObjectId(id),
    });
    const [product] = await Product.aggregate(pipeline);

    if (!product) throw new ApiError(404, "Product not found");
    return resolveImageUrls(product, [
      "thumbnail",
      "gallery",
      "file",
      "variants.image",
    ]);
  },
  // ----------------GET PRODUCT BY ID (all variants - active and inactive) --------------------
  async getByIdWithAllVariants(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid product id");

    const { pipeline } = buildProductPipeline(
      {},
      false,
      { _id: new mongoose.Types.ObjectId(id) },
      "all", // All variants regardless of status
    );
    const [product] = await Product.aggregate(pipeline);

    if (!product) throw new ApiError(404, "Product not found");
    return resolveImageUrls(product, [
      "thumbnail",
      "gallery",
      "file",
      "variants.image",
    ]);
  },

  // -------------------- GET PRODUCT BY SLUG --------------------
  async getBySlug(slug: string) {
    const { pipeline } = buildProductPipeline({}, false, { slug });
    const [product] = await Product.aggregate(pipeline);

    if (!product) throw new ApiError(404, "Product not found");
    return resolveImageUrls(product, [
      "thumbnail",
      "gallery",
      "file",
      "variants.image",
    ]);
  },
  // -------------------- ATTACH VARIANT TO PRODUCT --------------------
  async attachVariant(productId: string, variantId: string) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    if (!product.variants) product.variants = [];
    if (
      !product.variants.find((v: any) => v.toString() === variantId.toString())
    ) {
      product.variants.push(new Types.ObjectId(variantId));
      await product.save();
    }

    return product;
  },

  // -------------------- LIST ALL PRODUCTS --------------------
  async listAllProducts(query: Record<string, any>) {
    const { pipeline, page, limit, filters } = buildProductPipeline(query);
    const items = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(filters);

    return {
      data: resolveImageUrls(items, [
        "thumbnail",
        "gallery",
        "file",
        "variants.image",
      ]),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
  // -------------------- LIST ACTIVE PRODUCTS --------------------
  async listActiveProducts(query: Record<string, any>) {
    const { pipeline, page, limit, filters } = buildProductPipeline(
      query,
      true,
    );
    const items = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(filters);

    return {
      data: resolveImageUrls(items, [
        "thumbnail",
        "gallery",
        "file",
        "variants.image",
      ]),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
  // -------------------- LIST All ACTIVE Flash Sale PRODUCTS --------------------
  async listAllActiveFlashSaleProducts(query: Record<string, any>) {
    const { pipeline, page, limit, filters } = buildProductPipeline(
      query,
      true,
      { is_flash_sale: true },
    );

    const items = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(filters);

    return {
      data: resolveImageUrls(items, [
        "thumbnail",
        "gallery",
        "file",
        "variants.image",
      ]),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
  // -------------------- DELETE MULTIPLE PRODUCTS --------------------
  async deleteMultiple(ids: string[]) {
    // Validate all IDs
    const invalidIds = ids.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid product ids: ${invalidIds.join(", ")}`);

    // Find products
    const products = await Product.find({ _id: { $in: ids } });
    if (!products.length)
      throw new ApiError(404, "No products found for the given IDs");

    const productIds = products.map((p) => p._id);

    // 1. Physical file cleanup for all products and variants
    for (const product of products) {
      // Variant images
      const variants = await Variant.find({ productId: product._id });
      for (const v of variants) {
        if (v.image && !v.image.includes("placeholder.png")) {
          const file = v.image.split("/").pop();
          if (file) await fileService.deleteFile("products", file);
        }
      }

      // Product thumbnail
      if (product.thumbnail && !product.thumbnail.includes("placeholder.png")) {
        const thumbFile = product.thumbnail.split("/").pop();
        if (thumbFile) await fileService.deleteFile("products", thumbFile);
      }

      // Product gallery
      if (product.gallery && product.gallery.length > 0) {
        for (const img of product.gallery) {
          if (!img.includes("placeholder.png")) {
            const file = img.split("/").pop();
            if (file) await fileService.deleteFile("products", file);
          }
        }
      }
    }

    // 2. Database deletion
    await Variant.deleteMany({ productId: { $in: productIds } });
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    return result; // returns { deletedCount: number }
  },

  // -------------------- TOGGLE PUBLISH / FLASH SALE --------------------
  async togglePublished(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid product id");

    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    product.is_published = !product.is_published;
    product.publishedAt = product.is_published ? new Date() : undefined; // Set publishedAt when publishing, clear when unpublishing
    await product.save();

    return product;
  },

  // -------------------- TOGGLE FLASH SALE --------------------
  async toggleFlashSale(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid product id");

    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    product.is_flash_sale = !product.is_flash_sale;
    await product.save();

    return product;
  },

  // -------------------- TOGGLE MULTIPLE PUBLISH --------------------
  async toggleMultiplePublished(
    ids: string[],
    action: "publish" | "unpublish",
  ) {
    // Validate IDs
    const invalidIds = ids.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid product ids: ${invalidIds.join(", ")}`);

    // Find products
    const products = await Product.find({ _id: { $in: ids } });
    if (!products.length)
      throw new ApiError(404, "No products found for the given IDs");

    // Apply action
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        product.is_published = action === "publish";
        product.publishedAt = product.is_published ? new Date() : undefined; // Set publishedAt when publishing, clear when unpublishing
        return product.save();
      }),
    );

    return updatedProducts;
  },
  //get all products and products variants with discounts
  async getallOfferProducts() {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "variants",
          localField: "variants",
          foreignField: "_id",
          as: "variants",
        },
      },
      {
        $match: {
          $or: [
            { discount: { $gt: 0 } },
            { "variants.discount": { $gt: 0 } }, // ✅ now variants are populated
          ],
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          thumbnail: 1,
          gallery: 1,
          stock: 1,
          stock_alert: 1,
          sold: 1,
          ratings: 1,
          file: 1,
          sku: 1,
          short_description: 1,
          long_description: 1,
          meta_title: 1,
          meta_description: 1,
          keywords: 1,
          tags: 1,
          delivery: 1,
          is_free_shipping: 1,
          hasVariants: 1,
          is_published: 1,
          is_flash_sale: 1,
          brand: { _id: 1, name: 1, slug: 1 },
          categories: { _id: 1, name: 1, slug: 1 },
          collections: { _id: 1, name: 1, slug: 1 },
          regular_price: 1,
          sale_price: 1,
          purchase_price: 1,
          discount_type: 1,
          discount: 1,
          variants: 1,
          productAttributes: 1,
          reviews: 1,
        },
      },
    ]);

    return resolveImageUrls(products, ["thumbnail", "variants.image"]);
  },

  // -------------------- TOGGLE MULTIPLE FLASH SALE --------------------
  async toggleMultipleFlashSale(
    ids: string[],
    action: "flash_sale" | "disable_flash_sale",
  ) {
    // Validate IDs
    const invalidIds = ids.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid product ids: ${invalidIds.join(", ")}`);

    // Find products
    const products = await Product.find({ _id: { $in: ids } });
    if (!products.length)
      throw new ApiError(404, "No products found for the given IDs");

    // Apply action
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        product.is_flash_sale = action === "flash_sale";
        return product.save();
      }),
    );

    return updatedProducts;
  },
  //-------------search product--------------------
  async getSearchSuggestions(query: string) {
    if (!query) {
      return [];
    }

    const safeQuery = escapeRegex(query.trim());
    const regex = new RegExp(safeQuery, "i");
    const matchingBrands = await Brand.find({ name: regex }).select("_id");
    const brandIds = matchingBrands.map((b) => b._id);

    const matchingCategories = await Category.find({ name: regex }).select(
      "_id",
    );
    const matchingCollections = await Collection.find({ name: regex }).select(
      "products",
    );
    // console.log(matchingCollections);
    //console.log(matchingCategories)
    const categoryIds = matchingCategories.map((c) => c._id);
    const collectionIds = matchingCollections.flatMap((c) => c.products ?? []);
    //console.log(collectionIds);

    const products = await Product.aggregate([
      {
        $match: {
          is_published: true,
          $or: [
            { _id: { $in: collectionIds } },
            { name: regex },
            { slug: regex },
            { tags: regex },
            { keywords: regex },
            { brand: { $in: brandIds } },
            { categories: { $in: categoryIds } },
          ],
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          slug: 1,
          thumbnail: 1,
          regular_price: 1,
          "brand.name": 1,
        },
      },
      { $limit: 5 },
    ]);

    return resolveImageUrls(products, ["thumbnail"]);
  },
};
