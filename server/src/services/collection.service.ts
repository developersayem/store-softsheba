import mongoose from "mongoose";
import slugify from "slugify";
import fs from "fs";
import csv from "csv-parser";
import { Collection } from "../models/collection.model";
import { fileService } from "./utils/file.service";
import { resolveImageUrls } from "../utils/image-resolver.plugin";
import { ApiError } from "../utils/ApiError";
import { buildCollectionProductPipeline } from "./pipelines/buildCollectionProduct.pipeline";
import { Category } from "../models/category.model";
import { Product } from "../models/product.model";

// ---------------------- Helper ----------------------
async function generateUniqueSlug(name: string, excludeId?: string) {
  let baseSlug = slugify(name, { lower: true, strict: true });
  if (!baseSlug) baseSlug = `collection-${Date.now()}`;

  let slug = baseSlug;
  let exists = await Collection.findOne({ slug, _id: { $ne: excludeId } });

  while (exists) {
    slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
    exists = await Collection.findOne({ slug, _id: { $ne: excludeId } });
  }

  return slug;
}

// ---------------------- Service ----------------------
export const collectionService = {
  async create(payload: any, file?: Express.Multer.File) {
    const { name, description, isFeatured, isPublished, products, category } =
      payload;
    if (!name) throw new ApiError(400, "Collection name is required.");

    const slug = await generateUniqueSlug(name);

    let imageUrl = "";
    if (file) {
      const customName = fileService.generateFileName(file.originalname, slug);
      await fileService.moveFile(file, "collections", customName);
      imageUrl = fileService.getFileUrl("collections", customName);
    }
    let productsIds = products || [];
    if (category) {
      productsIds = await Product.find({
        categories: { $in: category },
        is_published: true,
      }).select("_id");
      //combine productIds and payload products and remove duplicates
      productsIds = [
        ...new Set([
          ...productsIds.map((p: any) => p._id.toString()),
          ...(products || []),
        ]),
      ];
    }

    const collection = await Collection.create({
      name,
      slug,
      description,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isPublished: isPublished === "true" || isPublished === true,
      products: productsIds,
      category,
      image: imageUrl,
      homeLimit: payload.homeLimit ? Number(payload.homeLimit) : 12,
      sortBy: payload.sortBy || "latest",
    });

    return resolveImageUrls(collection, ["image"]);
  },

  async update(id: string, payload: any, file?: Express.Multer.File) {
    if (!mongoose.isValidObjectId(id))
      throw new ApiError(400, "Invalid collection ID");

    const collection = await Collection.findById(id);
    if (!collection) throw new ApiError(404, "Collection not found");

    const name = payload.name ?? collection.name;
    collection.slug = await generateUniqueSlug(name, id);

    if (file) {
      if (collection.image)
        await fileService.deleteFile(
          "collections",
          collection.image.split("/").pop()!,
        );
      const customName = fileService.generateFileName(
        file.originalname,
        collection.slug,
      );
      await fileService.moveFile(file, "collections", customName);
      collection.image = fileService.getFileUrl("collections", customName);
    }
    console.log(payload.category);
    console.log("products:", payload.products);

    collection.name = name;
    if (payload.description !== undefined)
      collection.description = payload.description;
    if (payload.isFeatured !== undefined)
      collection.isFeatured =
        payload.isFeatured === "true" || payload.isFeatured === true;
    if (payload.isPublished !== undefined)
      collection.isPublished =
        payload.isPublished === "true" || payload.isPublished === true;

    // if (payload.category !== undefined) {
    //   collection.category = payload.category;
    //   //find all the products from product collection and add all products of the selected categories to the collection
    //   const products = await Product.find({
    //     categories: { $in: payload.category },
    //     is_published: true,
    //   }).select("_id");

    //   collection.products = [
    //     ...new Set([
    //       ...(collection.products as mongoose.Types.ObjectId[]),
    //       ...products.map((p) => p._id),
    //     ]),
    //   ];
    // }

    // if (payload.products !== undefined) collection.products = payload.products;

    if (payload.category !== undefined) {
      const oldCategories = collection.category || [];
      const newCategories = payload.category;
      collection.category = payload.category;

      const removedCategories = oldCategories.filter(
        (cat) => !newCategories.includes(cat),
      );

      const products = await Product.find({
        categories: { $in: payload.category },
        is_published: true,
      }).select("_id");

      // ✅ Deduplicate by converting to string
      let existingIds = (collection.products as mongoose.Types.ObjectId[]).map(
        (p) => p.toString(),
      );

      const removedProducts = await Product.find({
        categories: { $in: removedCategories },
        is_published: true,
      }).select("_id");

      if (removedProducts.length > 0) {
        //filter out removed products from extistingIds
        existingIds = existingIds.filter(
          (id) => !removedProducts.some((rp) => rp._id.toString() === id),
        );
      }

      const newIds = products.map((p) => p._id.toString());

      const merged = [...new Set([...existingIds, ...newIds])];

      // ✅ Only update products if payload.products is NOT also provided
      if (payload.products === undefined) {
        collection.products = merged.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }
    }

    if (payload.products !== undefined) {
      collection.products = payload.products;
    }

    if (payload.homeLimit !== undefined)
      collection.homeLimit = Number(payload.homeLimit);
    if (payload.sortBy !== undefined) collection.sortBy = payload.sortBy;

    await collection.save();
    return resolveImageUrls(collection, ["image"]);
  },
  async updateOrder(updates: { id: string; order: number }[]) {
    const bulkOps = updates.map((u) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(u.id) },
        update: { $set: { order: u.order } },
      },
    }));

    await Collection.bulkWrite(bulkOps);
    return { message: "Order updated" };
  },

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new ApiError(400, "Invalid collection ID");

    const collection = await Collection.findByIdAndDelete(id);
    if (!collection) throw new ApiError(404, "Collection not found");

    if (collection.image)
      await fileService.deleteFile(
        "collections",
        collection.image.split("/").pop()!,
      );
    return { message: "Collection deleted" };
  },

  async deleteMultiple(ids: string[]) {
    const validIds = ids.filter(mongoose.isValidObjectId);
    const collections = await Collection.find({ _id: { $in: validIds } });

    await Promise.all(
      collections.map(async (col) => {
        if (col.image)
          await fileService.deleteFile(
            "collections",
            col.image.split("/").pop()!,
          );
      }),
    );

    const result = await Collection.deleteMany({ _id: { $in: validIds } });
    return result.deletedCount;
  },

  async togglePublished(id: string) {
    const col = await Collection.findById(id);
    if (!col) throw new ApiError(404, "Collection not found");
    col.isPublished = !col.isPublished;
    await col.save();
    return col.isPublished;
  },

  async toggleFeatured(id: string) {
    const col = await Collection.findById(id);
    if (!col) throw new ApiError(404, "Collection not found");
    col.isFeatured = !col.isFeatured;
    await col.save();
    return col.isFeatured;
  },

  async toggleMultiplePublished(
    ids: string[],
    action: "publish" | "unpublish",
  ) {
    const isPublished = action === "publish";
    await Collection.updateMany(
      { _id: { $in: ids } },
      { $set: { isPublished } },
    );
    return isPublished;
  },

  async toggleMultipleFeatured(ids: string[], action: "feature" | "unfeature") {
    const isFeatured = action === "feature";
    await Collection.updateMany(
      { _id: { $in: ids } },
      { $set: { isFeatured } },
    );
    return isFeatured;
  },

  async getAll() {
    const collections = await Collection.find().sort({
      order: 1,
      createdAt: -1,
    });
    return resolveImageUrls(collections, ["image"]);
  },

  async getAllWithProducts() {
    const collections = await Collection.aggregate([
      // Only published collections
      { $match: { isPublished: true } },

      {
        $lookup: {
          from: "products",
          let: {
            productIds: "$products",
            colSortBy: "$sortBy",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$productIds"] },
                    { $eq: ["$is_published", true] },
                  ],
                },
              },
            },
            ...buildCollectionProductPipeline(true),
          ] as any,
          as: "products",
        },
      },
      // Slice products based on collection's homeLimit
      {
        $addFields: {
          products: {
            $slice: ["$products", { $ifNull: ["$homeLimit", 12] }],
          },
        },
      },
      // Remove empty collections
      { $match: { "products.0": { $exists: true } } },

      { $sort: { order: 1, createdAt: -1 } },
    ]);

    return resolveImageUrls(collections, [
      "image",
      "products.thumbnail",
      "products.gallery",
      "products.variants.image",
    ]);
  },
  async getBySlug(slug: string) {
    const collection = await Collection.aggregate([
      { $match: { slug } },
      {
        $lookup: {
          from: "products",
          let: {
            productIds: "$products",
            colSortBy: "$sortBy",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$productIds"] },
                    { $eq: ["$is_published", true] },
                  ],
                },
              },
            },
            ...buildCollectionProductPipeline(true),
          ] as any,
          as: "productsData",
        },
      },
    ]);
    if (!collection.length) throw new ApiError(404, "Collection not found");

    return resolveImageUrls(collection[0], [
      "image",
      "productsData.thumbnail",
      "productsData.gallery",
      "productsData.variants.image",
    ]);
  },

  async importCollections(filePath: string, ext: string) {
    const rows: any[] = [];

    if (ext === "json") {
      const raw = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);

      for (const col of parsed) {
        const slug = await generateUniqueSlug(col.name);
        await Collection.create({
          name: col.name,
          slug,
          description: col.description || "",
          products: col.products || [],
          isPublished: col.isPublished === "true" || col.isPublished === true,
          image: col.image || "",
          homeLimit: col.homeLimit ? Number(col.homeLimit) : 12,
          sortBy: col.sortBy || "latest",
        });
      }

      await fs.promises.unlink(filePath);
      return parsed.length;
    }

    if (ext === "csv") {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => rows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });

      for (const row of rows) {
        const slug = await generateUniqueSlug(row.Name);
        await Collection.create({
          name: row.Name,
          slug,
          description: row.Description || "",
          products: row.Products ? row.Products.split("|") : [],
          isFeatured: row.Featured === "true",
          isPublished: row.Published === "true",
          image: row.Image || "",
          homeLimit: row.HomeLimit ? Number(row.HomeLimit) : 12,
          sortBy: row.SortBy || "latest",
        });
      }

      await fs.promises.unlink(filePath);
      return rows.length;
    }

    throw new ApiError(400, "Unsupported file format");
  },
};
