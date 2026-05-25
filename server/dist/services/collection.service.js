"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const collection_model_1 = require("../models/collection.model");
const file_service_1 = require("./utils/file.service");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const ApiError_1 = require("../utils/ApiError");
const buildCollectionProduct_pipeline_1 = require("./pipelines/buildCollectionProduct.pipeline");
const product_model_1 = require("../models/product.model");
// ---------------------- Helper ----------------------
async function generateUniqueSlug(name, excludeId) {
    let baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true });
    if (!baseSlug)
        baseSlug = `collection-${Date.now()}`;
    let slug = baseSlug;
    let exists = await collection_model_1.Collection.findOne({ slug, _id: { $ne: excludeId } });
    while (exists) {
        slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
        exists = await collection_model_1.Collection.findOne({ slug, _id: { $ne: excludeId } });
    }
    return slug;
}
// ---------------------- Service ----------------------
exports.collectionService = {
    async create(payload, file) {
        const { name, description, isFeatured, isPublished, products, category } = payload;
        if (!name)
            throw new ApiError_1.ApiError(400, "Collection name is required.");
        const slug = await generateUniqueSlug(name);
        let imageUrl = "";
        if (file) {
            const customName = file_service_1.fileService.generateFileName(file.originalname, slug);
            await file_service_1.fileService.moveFile(file, "collections", customName);
            imageUrl = file_service_1.fileService.getFileUrl("collections", customName);
        }
        let productsIds = products || [];
        if (category) {
            productsIds = await product_model_1.Product.find({
                categories: { $in: category },
                is_published: true,
            }).select("_id");
            //combine productIds and payload products and remove duplicates
            productsIds = [
                ...new Set([
                    ...productsIds.map((p) => p._id.toString()),
                    ...(products || []),
                ]),
            ];
        }
        const collection = await collection_model_1.Collection.create({
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
        return (0, image_resolver_plugin_1.resolveImageUrls)(collection, ["image"]);
    },
    async update(id, payload, file) {
        if (!mongoose_1.default.isValidObjectId(id))
            throw new ApiError_1.ApiError(400, "Invalid collection ID");
        const collection = await collection_model_1.Collection.findById(id);
        if (!collection)
            throw new ApiError_1.ApiError(404, "Collection not found");
        const name = payload.name ?? collection.name;
        collection.slug = await generateUniqueSlug(name, id);
        if (file) {
            if (collection.image)
                await file_service_1.fileService.deleteFile("collections", collection.image.split("/").pop());
            const customName = file_service_1.fileService.generateFileName(file.originalname, collection.slug);
            await file_service_1.fileService.moveFile(file, "collections", customName);
            collection.image = file_service_1.fileService.getFileUrl("collections", customName);
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
            const removedCategories = oldCategories.filter((cat) => !newCategories.includes(cat));
            const products = await product_model_1.Product.find({
                categories: { $in: payload.category },
                is_published: true,
            }).select("_id");
            // ✅ Deduplicate by converting to string
            let existingIds = collection.products.map((p) => p.toString());
            const removedProducts = await product_model_1.Product.find({
                categories: { $in: removedCategories },
                is_published: true,
            }).select("_id");
            if (removedProducts.length > 0) {
                //filter out removed products from extistingIds
                existingIds = existingIds.filter((id) => !removedProducts.some((rp) => rp._id.toString() === id));
            }
            const newIds = products.map((p) => p._id.toString());
            const merged = [...new Set([...existingIds, ...newIds])];
            // ✅ Only update products if payload.products is NOT also provided
            if (payload.products === undefined) {
                collection.products = merged.map((id) => new mongoose_1.default.Types.ObjectId(id));
            }
        }
        if (payload.products !== undefined) {
            collection.products = payload.products;
        }
        if (payload.homeLimit !== undefined)
            collection.homeLimit = Number(payload.homeLimit);
        if (payload.sortBy !== undefined)
            collection.sortBy = payload.sortBy;
        await collection.save();
        return (0, image_resolver_plugin_1.resolveImageUrls)(collection, ["image"]);
    },
    async updateOrder(updates) {
        const bulkOps = updates.map((u) => ({
            updateOne: {
                filter: { _id: new mongoose_1.default.Types.ObjectId(u.id) },
                update: { $set: { order: u.order } },
            },
        }));
        await collection_model_1.Collection.bulkWrite(bulkOps);
        return { message: "Order updated" };
    },
    async delete(id) {
        if (!mongoose_1.default.isValidObjectId(id))
            throw new ApiError_1.ApiError(400, "Invalid collection ID");
        const collection = await collection_model_1.Collection.findByIdAndDelete(id);
        if (!collection)
            throw new ApiError_1.ApiError(404, "Collection not found");
        if (collection.image)
            await file_service_1.fileService.deleteFile("collections", collection.image.split("/").pop());
        return { message: "Collection deleted" };
    },
    async deleteMultiple(ids) {
        const validIds = ids.filter(mongoose_1.default.isValidObjectId);
        const collections = await collection_model_1.Collection.find({ _id: { $in: validIds } });
        await Promise.all(collections.map(async (col) => {
            if (col.image)
                await file_service_1.fileService.deleteFile("collections", col.image.split("/").pop());
        }));
        const result = await collection_model_1.Collection.deleteMany({ _id: { $in: validIds } });
        return result.deletedCount;
    },
    async togglePublished(id) {
        const col = await collection_model_1.Collection.findById(id);
        if (!col)
            throw new ApiError_1.ApiError(404, "Collection not found");
        col.isPublished = !col.isPublished;
        await col.save();
        return col.isPublished;
    },
    async toggleFeatured(id) {
        const col = await collection_model_1.Collection.findById(id);
        if (!col)
            throw new ApiError_1.ApiError(404, "Collection not found");
        col.isFeatured = !col.isFeatured;
        await col.save();
        return col.isFeatured;
    },
    async toggleMultiplePublished(ids, action) {
        const isPublished = action === "publish";
        await collection_model_1.Collection.updateMany({ _id: { $in: ids } }, { $set: { isPublished } });
        return isPublished;
    },
    async toggleMultipleFeatured(ids, action) {
        const isFeatured = action === "feature";
        await collection_model_1.Collection.updateMany({ _id: { $in: ids } }, { $set: { isFeatured } });
        return isFeatured;
    },
    async getAll() {
        const collections = await collection_model_1.Collection.find().sort({
            order: 1,
            createdAt: -1,
        });
        return (0, image_resolver_plugin_1.resolveImageUrls)(collections, ["image"]);
    },
    async getAllWithProducts() {
        const collections = await collection_model_1.Collection.aggregate([
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
                        ...(0, buildCollectionProduct_pipeline_1.buildCollectionProductPipeline)(true),
                    ],
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
        return (0, image_resolver_plugin_1.resolveImageUrls)(collections, [
            "image",
            "products.thumbnail",
            "products.gallery",
            "products.variants.image",
        ]);
    },
    async getBySlug(slug) {
        const collection = await collection_model_1.Collection.aggregate([
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
                        ...(0, buildCollectionProduct_pipeline_1.buildCollectionProductPipeline)(true),
                    ],
                    as: "productsData",
                },
            },
        ]);
        if (!collection.length)
            throw new ApiError_1.ApiError(404, "Collection not found");
        return (0, image_resolver_plugin_1.resolveImageUrls)(collection[0], [
            "image",
            "productsData.thumbnail",
            "productsData.gallery",
            "productsData.variants.image",
        ]);
    },
    async importCollections(filePath, ext) {
        const rows = [];
        if (ext === "json") {
            const raw = await fs_1.default.promises.readFile(filePath, "utf-8");
            const parsed = JSON.parse(raw);
            for (const col of parsed) {
                const slug = await generateUniqueSlug(col.name);
                await collection_model_1.Collection.create({
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
            await fs_1.default.promises.unlink(filePath);
            return parsed.length;
        }
        if (ext === "csv") {
            await new Promise((resolve, reject) => {
                fs_1.default.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)())
                    .on("data", (row) => rows.push(row))
                    .on("end", resolve)
                    .on("error", reject);
            });
            for (const row of rows) {
                const slug = await generateUniqueSlug(row.Name);
                await collection_model_1.Collection.create({
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
            await fs_1.default.promises.unlink(filePath);
            return rows.length;
        }
        throw new ApiError_1.ApiError(400, "Unsupported file format");
    },
};
