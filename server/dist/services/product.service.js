"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
// services/product.service.ts
const mongoose_1 = __importStar(require("mongoose"));
const product_model_1 = require("../models/product.model");
const variant_model_1 = require("../models/variant.model");
const ApiError_1 = require("../utils/ApiError");
const buildProduct_pipeline_1 = require("./pipelines/buildProduct.pipeline");
const brand_model_1 = require("../models/brand.model");
const category_model_1 = require("../models/category.model");
const collection_model_1 = require("../models/collection.model");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
exports.productService = {
    // -------------------- CREATE PRODUCT --------------------
    async createProduct(payload) {
        if (!payload.name)
            throw new ApiError_1.ApiError(400, "Product name is required");
        console.log(payload);
        const doc = await product_model_1.Product.create({
            ...payload,
            thumbnail: payload.thumbnail || "",
            attributes: payload.attributes || [],
            variants: [],
            gallery: payload.gallery || [],
        });
        if (payload.collections?.length) {
            await collection_model_1.Collection.updateMany({ _id: { $in: payload.collections } }, { $addToSet: { products: doc._id } });
        }
        return doc;
    },
    // -------------------- UPDATE PRODUCT --------------------
    async updateProduct(id, payload) {
        const product = await product_model_1.Product.findById(id);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        // Capture old collections for synchronization
        const oldCollections = product.collections?.map((c) => c.toString()) || [];
        // List of fields allowed to update
        const updatable = [
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
                product[field] = payload[field];
            }
        });
        await product.save();
        // Synchronize collections
        if (payload.collections !== undefined) {
            const newCollections = payload.collections.map((c) => c.toString());
            // Collections to remove the product from
            const removed = oldCollections.filter((c) => !newCollections.includes(c));
            if (removed.length > 0) {
                await collection_model_1.Collection.updateMany({ _id: { $in: removed } }, { $pull: { products: product._id } });
            }
            // Collections to add the product to
            const added = newCollections.filter((c) => !oldCollections.includes(c));
            if (added.length > 0) {
                await collection_model_1.Collection.updateMany({ _id: { $in: added } }, { $addToSet: { products: product._id } });
            }
        }
        return product;
    },
    // -------------------- DELETE PRODUCT --------------------
    async deleteProduct(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid product id");
        const product = await product_model_1.Product.findById(id);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        // Cascade delete variants
        await variant_model_1.Variant.deleteMany({ productId: product._id });
        const result = await product_model_1.Product.findByIdAndDelete(id);
        return result;
    },
    // -------------------- GET PRODUCT BY ID --------------------
    async getById(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid product id");
        const { pipeline } = (0, buildProduct_pipeline_1.buildProductPipeline)({}, false, {
            _id: new mongoose_1.default.Types.ObjectId(id),
        });
        const [product] = await product_model_1.Product.aggregate(pipeline);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        return (0, image_resolver_plugin_1.resolveImageUrls)(product, [
            "thumbnail",
            "gallery",
            "file",
            "variants.image",
        ]);
    },
    // ----------------GET PRODUCT BY ID (all variants - active and inactive) --------------------
    async getByIdWithAllVariants(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid product id");
        const { pipeline } = (0, buildProduct_pipeline_1.buildProductPipeline)({}, false, { _id: new mongoose_1.default.Types.ObjectId(id) }, "all");
        const [product] = await product_model_1.Product.aggregate(pipeline);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        return (0, image_resolver_plugin_1.resolveImageUrls)(product, [
            "thumbnail",
            "gallery",
            "file",
            "variants.image",
        ]);
    },
    // -------------------- GET PRODUCT BY SLUG --------------------
    async getBySlug(slug) {
        const { pipeline } = (0, buildProduct_pipeline_1.buildProductPipeline)({}, false, { slug });
        const [product] = await product_model_1.Product.aggregate(pipeline);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        return (0, image_resolver_plugin_1.resolveImageUrls)(product, [
            "thumbnail",
            "gallery",
            "file",
            "variants.image",
        ]);
    },
    // -------------------- ATTACH VARIANT TO PRODUCT --------------------
    async attachVariant(productId, variantId) {
        const product = await product_model_1.Product.findById(productId);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        if (!product.variants)
            product.variants = [];
        if (!product.variants.find((v) => v.toString() === variantId.toString())) {
            product.variants.push(new mongoose_1.Types.ObjectId(variantId));
            await product.save();
        }
        return product;
    },
    // -------------------- LIST ALL PRODUCTS --------------------
    async listAllProducts(query) {
        const { pipeline, page, limit, filters } = (0, buildProduct_pipeline_1.buildProductPipeline)(query);
        const items = await product_model_1.Product.aggregate(pipeline);
        const total = await product_model_1.Product.countDocuments(filters);
        return {
            data: (0, image_resolver_plugin_1.resolveImageUrls)(items, [
                "thumbnail",
                "gallery",
                "file",
                "variants.image",
            ]),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
    // -------------------- LIST ACTIVE PRODUCTS --------------------
    async listActiveProducts(query) {
        const { pipeline, page, limit, filters } = (0, buildProduct_pipeline_1.buildProductPipeline)(query, true);
        const items = await product_model_1.Product.aggregate(pipeline);
        const total = await product_model_1.Product.countDocuments(filters);
        return {
            data: (0, image_resolver_plugin_1.resolveImageUrls)(items, [
                "thumbnail",
                "gallery",
                "file",
                "variants.image",
            ]),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
    // -------------------- LIST All ACTIVE Flash Sale PRODUCTS --------------------
    async listAllActiveFlashSaleProducts(query) {
        const { pipeline, page, limit, filters } = (0, buildProduct_pipeline_1.buildProductPipeline)(query, true, { is_flash_sale: true });
        const items = await product_model_1.Product.aggregate(pipeline);
        const total = await product_model_1.Product.countDocuments(filters);
        return {
            data: (0, image_resolver_plugin_1.resolveImageUrls)(items, [
                "thumbnail",
                "gallery",
                "file",
                "variants.image",
            ]),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
    // -------------------- DELETE MULTIPLE PRODUCTS --------------------
    async deleteMultiple(ids) {
        // Validate all IDs
        const invalidIds = ids.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid product ids: ${invalidIds.join(", ")}`);
        // Find products
        const products = await product_model_1.Product.find({ _id: { $in: ids } });
        if (!products.length)
            throw new ApiError_1.ApiError(404, "No products found for the given IDs");
        // Delete associated variants
        const productIds = products.map((p) => p._id);
        await variant_model_1.Variant.deleteMany({ productId: { $in: productIds } });
        // Delete products
        const result = await product_model_1.Product.deleteMany({ _id: { $in: productIds } });
        return result; // returns { deletedCount: number }
    },
    // -------------------- TOGGLE PUBLISH / FLASH SALE --------------------
    async togglePublished(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid product id");
        const product = await product_model_1.Product.findById(id);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        product.is_published = !product.is_published;
        product.publishedAt = product.is_published ? new Date() : undefined; // Set publishedAt when publishing, clear when unpublishing
        await product.save();
        return product;
    },
    // -------------------- TOGGLE FLASH SALE --------------------
    async toggleFlashSale(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid product id");
        const product = await product_model_1.Product.findById(id);
        if (!product)
            throw new ApiError_1.ApiError(404, "Product not found");
        product.is_flash_sale = !product.is_flash_sale;
        await product.save();
        return product;
    },
    // -------------------- TOGGLE MULTIPLE PUBLISH --------------------
    async toggleMultiplePublished(ids, action) {
        // Validate IDs
        const invalidIds = ids.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid product ids: ${invalidIds.join(", ")}`);
        // Find products
        const products = await product_model_1.Product.find({ _id: { $in: ids } });
        if (!products.length)
            throw new ApiError_1.ApiError(404, "No products found for the given IDs");
        // Apply action
        const updatedProducts = await Promise.all(products.map(async (product) => {
            product.is_published = action === "publish";
            product.publishedAt = product.is_published ? new Date() : undefined; // Set publishedAt when publishing, clear when unpublishing
            return product.save();
        }));
        return updatedProducts;
    },
    //get all products and products variants with discounts
    async getallOfferProducts() {
        const products = await product_model_1.Product.aggregate([
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
        return (0, image_resolver_plugin_1.resolveImageUrls)(products, ["thumbnail", "variants.image"]);
    },
    // -------------------- TOGGLE MULTIPLE FLASH SALE --------------------
    async toggleMultipleFlashSale(ids, action) {
        // Validate IDs
        const invalidIds = ids.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid product ids: ${invalidIds.join(", ")}`);
        // Find products
        const products = await product_model_1.Product.find({ _id: { $in: ids } });
        if (!products.length)
            throw new ApiError_1.ApiError(404, "No products found for the given IDs");
        // Apply action
        const updatedProducts = await Promise.all(products.map(async (product) => {
            product.is_flash_sale = action === "flash_sale";
            return product.save();
        }));
        return updatedProducts;
    },
    //-------------search product--------------------
    async getSearchSuggestions(query) {
        if (!query) {
            return [];
        }
        const safeQuery = escapeRegex(query.trim());
        const regex = new RegExp(safeQuery, "i");
        const matchingBrands = await brand_model_1.Brand.find({ name: regex }).select("_id");
        const brandIds = matchingBrands.map((b) => b._id);
        const matchingCategories = await category_model_1.Category.find({ name: regex }).select("_id");
        const matchingCollections = await collection_model_1.Collection.find({ name: regex }).select("products");
        // console.log(matchingCollections);
        //console.log(matchingCategories)
        const categoryIds = matchingCategories.map((c) => c._id);
        const collectionIds = matchingCollections.flatMap((c) => c.products ?? []);
        //console.log(collectionIds);
        const products = await product_model_1.Product.aggregate([
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
        return (0, image_resolver_plugin_1.resolveImageUrls)(products, ["thumbnail"]);
    },
};
