"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProductPipeline = buildProductPipeline;
const mongoose_1 = require("mongoose");
function buildProductPipeline(query, onlyPublished = false, filterOverrides = {}, variantStatus = "active") {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = query.limit !== undefined ? parseInt(query.limit) : 100000;
    const skip = (page - 1) * limit;
    const filters = { ...filterOverrides };
    if (onlyPublished)
        filters.is_published = true;
    // Only add search, categories, etc., if not filtering by ID/slug
    if (!filterOverrides._id && !filterOverrides.slug) {
        if (query.q) {
            const q = query.q.trim();
            filters.$or = [
                { name: { $regex: q, $options: "i" } },
                { short_description: { $regex: q, $options: "i" } },
                { long_description: { $regex: q, $options: "i" } },
                { sku: { $regex: q, $options: "i" } },
            ];
        }
        if (query.category) {
            const cats = query.category
                .split(",")
                .map((c) => new mongoose_1.Types.ObjectId(c.trim()));
            filters.categories = { $in: cats };
        }
        if (query.collection) {
            const cols = query.collection
                .split(",")
                .map((c) => new mongoose_1.Types.ObjectId(c.trim()));
            filters.collections = { $in: cols };
        }
        if (query.brand)
            filters.brand = new mongoose_1.Types.ObjectId(query.brand);
        if (!onlyPublished && query.is_published !== undefined) {
            const val = query.is_published === "true" || query.is_published === true;
            filters.is_published = val;
        }
        if (query.minPrice || query.maxPrice) {
            filters.regular_price = {};
            if (query.minPrice)
                filters.regular_price.$gte = Number(query.minPrice);
            if (query.maxPrice)
                filters.regular_price.$lte = Number(query.maxPrice);
        }
    }
    const sortMap = {
        price: "regular_price",
        createdAt: "createdAt",
        sold: "sold",
        name: "name",
    };
    const sortBy = sortMap[query.sortBy] || "createdAt";
    const sortDir = query.sortDir === "asc" ? 1 : -1;
    // Build variant match condition based on variantStatus
    const variantMatchCondition = {
        $expr: { $eq: ["$productId", "$$productId"] },
    };
    if (variantStatus === "active") {
        variantMatchCondition.status = "active";
    }
    else if (variantStatus === "inactive") {
        variantMatchCondition.status = "inactive";
    }
    // If variantStatus === "all", don't add status filter
    if (onlyPublished) {
        variantMatchCondition.stock = { $gt: 0 };
    }
    const pipeline = [
        { $match: filters },
        { $sort: { [sortBy]: sortDir } },
        { $skip: skip },
        { $limit: limit },
        // Brand
        {
            $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
            },
        },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
        // Categories
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories",
            },
        },
        {
            $lookup: {
                from: "collections",
                localField: "collections",
                foreignField: "_id",
                as: "collections",
            },
        },
        // Shipping Rule
        {
            $lookup: {
                from: "shippingrules",
                localField: "delivery",
                foreignField: "_id",
                as: "delivery",
            },
        },
        { $unwind: { path: "$delivery", preserveNullAndEmptyArrays: true } },
        // Variants + attributes
        {
            $lookup: {
                from: "variants",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: variantMatchCondition,
                    },
                    {
                        $lookup: {
                            from: "attributes",
                            localField: "attributes.attributeId",
                            foreignField: "_id",
                            as: "attributeDocs",
                        },
                    },
                    {
                        $addFields: {
                            attributes: {
                                $map: {
                                    input: "$attributes",
                                    as: "attr",
                                    in: {
                                        attributeId: "$$attr.attributeId",
                                        value: "$$attr.value",
                                        name: {
                                            $arrayElemAt: [
                                                {
                                                    $map: {
                                                        input: {
                                                            $filter: {
                                                                input: "$attributeDocs",
                                                                as: "ad",
                                                                cond: {
                                                                    $eq: ["$$ad._id", "$$attr.attributeId"],
                                                                },
                                                            },
                                                        },
                                                        as: "m",
                                                        in: "$$m.name",
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    { $project: { productId: 0, __v: 0, attributeDocs: 0 } },
                ],
                as: "variants",
            },
        },
        // Reviews (approved only)
        {
            $lookup: {
                from: "reviews",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$product", "$$productId"] },
                            isApproved: true,
                        },
                    },
                    {
                        $group: {
                            _id: "$product",
                            averageRating: { $avg: "$rating" },
                            reviewCount: { $sum: 1 },
                            latestReviews: {
                                $push: {
                                    name: "$name",
                                    rating: "$rating",
                                    comment: "$comment",
                                    createdAt: "$createdAt",
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            averageRating: { $round: ["$averageRating", 1] },
                            reviewCount: 1,
                            latestReviews: { $slice: ["$latestReviews", 3] },
                        },
                    },
                ],
                as: "reviewsMeta",
            },
        },
        {
            $addFields: {
                reviews: {
                    $ifNull: [
                        { $arrayElemAt: ["$reviewsMeta", 0] },
                        {
                            averageRating: 0,
                            reviewCount: 0,
                            latestReviews: [],
                        },
                    ],
                },
            },
        },
        // Product Attributes lookup
        {
            $lookup: {
                from: "attributes",
                localField: "productAttributes.attributeId",
                foreignField: "_id",
                as: "productAttributeDocs",
            },
        },
        {
            $addFields: {
                productAttributes: {
                    $map: {
                        input: "$productAttributes",
                        as: "attr",
                        in: {
                            attributeId: "$$attr.attributeId",
                            value: "$$attr.value",
                            name: {
                                $arrayElemAt: [
                                    {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$productAttributeDocs",
                                                    as: "ad",
                                                    cond: {
                                                        $eq: ["$$ad._id", "$$attr.attributeId"],
                                                    },
                                                },
                                            },
                                            as: "m",
                                            in: "$$m.name",
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                },
            },
        },
        //  Project
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
                publishedAt: 1,
            },
        },
    ];
    return { pipeline, page, limit, filters };
}
