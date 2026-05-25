"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCollectionProductPipeline = buildCollectionProductPipeline;
function buildCollectionProductPipeline(onlyPublished = true) {
    return [
        // 🔒 Collection-product boundary (MUST come first)
        {
            $match: {
                $expr: {
                    $and: [
                        { $in: ["$_id", "$$productIds"] },
                        ...(onlyPublished ? [{ $eq: ["$is_published", true] }] : []),
                    ],
                },
            },
        },
        // ---------- Lookup First Variant for Pricing ----------
        {
            $lookup: {
                from: "variants",
                let: { firstVariantId: { $arrayElemAt: ["$variants", 0] } },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$firstVariantId"] } } },
                    {
                        $project: {
                            regular_price: 1,
                            sale_price: 1,
                            discount: 1,
                            discount_type: 1,
                        },
                    },
                ],
                as: "firstVariantDoc",
            },
        },
        {
            $addFields: {
                effectiveSortPrice: {
                    $ifNull: [
                        { $arrayElemAt: ["$firstVariantDoc.regular_price", 0] },
                        "$regular_price",
                    ],
                },
                effectiveSortDiscount: {
                    $ifNull: [
                        { $arrayElemAt: ["$firstVariantDoc.discount", 0] },
                        "$discount",
                    ],
                },
            },
        },
        // ---------- Sort ----------
        {
            $addFields: {
                sortValue: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ["$$colSortBy", "low_price"] },
                                then: "$effectiveSortPrice",
                            },
                            {
                                case: { $eq: ["$$colSortBy", "high_price"] },
                                then: { $subtract: [1000000000, "$effectiveSortPrice"] },
                            },
                            {
                                case: { $eq: ["$$colSortBy", "oldest"] },
                                then: "$createdAt",
                            },
                            {
                                case: { $eq: ["$$colSortBy", "flash_sale"] },
                                then: { $cond: [{ $eq: ["$is_flash_sale", true] }, 0, 1] },
                            },
                            {
                                case: { $eq: ["$$colSortBy", "big_discount"] },
                                then: { $subtract: [1000000, "$effectiveSortDiscount"] },
                            },
                        ],
                        default: {
                            $subtract: [
                                new Date("2099-01-01").getTime(),
                                { $toLong: "$createdAt" },
                            ],
                        },
                    },
                },
            },
        },
        { $sort: { sortValue: 1 } },
        // ---------- Brand ----------
        {
            $lookup: {
                from: "brands",
                localField: "brand",
                foreignField: "_id",
                as: "brand",
            },
        },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
        // ---------- Categories ----------
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories",
            },
        },
        // ---------- Variants ----------
        {
            $lookup: {
                from: "variants",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$productId", "$$productId"] },
                            status: "active",
                            ...(onlyPublished ? { stock: { $gt: 0 } } : {}),
                        },
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
                    { $project: { attributeDocs: 0, __v: 0, productId: 0 } },
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
        // ---------- Shape (same as product listing) ----------
        {
            $project: {
                name: 1,
                slug: 1,
                thumbnail: 1,
                gallery: 1,
                stock: 1,
                stock_alert: 1,
                sold: 1,
                sku: 1,
                file: 1,
                short_description: 1,
                long_description: 1,
                meta_title: 1,
                meta_description: 1,
                keywords: 1,
                tags: 1,
                delivery: 1,
                hasVariants: 1,
                is_published: 1,
                is_flash_sale: 1,
                regular_price: 1,
                ratings: 1,
                discount_type: 1,
                discount: 1,
                brand: { _id: 1, name: 1, slug: 1 },
                categories: { _id: 1, name: 1, slug: 1 },
                variants: 1,
            },
        },
    ];
}
