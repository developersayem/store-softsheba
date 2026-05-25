"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const category_model_1 = require("../models/category.model");
const file_service_1 = require("./utils/file.service");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const ApiError_1 = require("../utils/ApiError");
// ---------------------- Helper ----------------------
async function generateUniqueSlug(name, excludeId) {
    let baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true });
    if (!baseSlug)
        baseSlug = `category-${Date.now()}`;
    let slug = baseSlug;
    let exists = await category_model_1.Category.findOne({ slug, _id: { $ne: excludeId } });
    while (exists) {
        slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
        exists = await category_model_1.Category.findOne({ slug, _id: { $ne: excludeId } });
    }
    return slug;
}
// ---------------------- Service ----------------------
exports.categoryService = {
    async create(payload, files) {
        const { name, description, parent, isFeatured, isPublished } = payload;
        if (!name)
            throw new ApiError_1.ApiError(400, "Category name is required");
        const slug = await generateUniqueSlug(name);
        let icon = "";
        let banner = "";
        if (files?.icon?.[0]) {
            const f = files.icon[0];
            const fileName = file_service_1.fileService.generateFileName(f.originalname, slug);
            await file_service_1.fileService.moveFile(f, "categories/icons", fileName);
            icon = file_service_1.fileService.getFileUrl("categories/icons", fileName);
        }
        if (files?.banner?.[0]) {
            const f = files.banner[0];
            const fileName = file_service_1.fileService.generateFileName(f.originalname, slug);
            await file_service_1.fileService.moveFile(f, "categories/banners", fileName);
            banner = file_service_1.fileService.getFileUrl("categories/banners", fileName);
        }
        const parentCategory = parent ? await category_model_1.Category.findById(parent) : null;
        const category = await category_model_1.Category.create({
            name,
            slug,
            description,
            parent: parentCategory?._id || null,
            icon,
            banner,
            isFeatured: isFeatured === "true" || isFeatured === true,
            isPublished: isPublished === "true" || isPublished === true,
        });
        return (0, image_resolver_plugin_1.resolveImageUrls)(category, ["icon", "banner"]);
    },
    async update(id, payload, files) {
        if (!mongoose_1.default.isValidObjectId(id))
            throw new ApiError_1.ApiError(400, "Invalid category ID");
        const category = await category_model_1.Category.findById(id);
        if (!category)
            throw new ApiError_1.ApiError(404, "Category not found");
        const name = payload.name ?? category.name;
        category.slug = await generateUniqueSlug(name, id);
        if (files?.icon?.[0]) {
            if (category.icon)
                await file_service_1.fileService.deleteFile("categories/icons", category.icon.split("/").pop());
            const f = files.icon[0];
            const fileName = file_service_1.fileService.generateFileName(f.originalname, category.slug);
            await file_service_1.fileService.moveFile(f, "categories/icons", fileName);
            category.icon = file_service_1.fileService.getFileUrl("categories/icons", fileName);
        }
        if (files?.banner?.[0]) {
            if (category.banner)
                await file_service_1.fileService.deleteFile("categories/banners", category.banner.split("/").pop());
            const f = files.banner[0];
            const fileName = file_service_1.fileService.generateFileName(f.originalname, category.slug);
            await file_service_1.fileService.moveFile(f, "categories/banners", fileName);
            category.banner = file_service_1.fileService.getFileUrl("categories/banners", fileName);
        }
        if (payload.name)
            category.name = payload.name;
        if (payload.description !== undefined)
            category.description = payload.description;
        if (payload.parent !== undefined)
            category.parent = payload.parent || null;
        if (payload.isFeatured !== undefined)
            category.isFeatured =
                payload.isFeatured === "true" || payload.isFeatured === true;
        if (payload.isPublished !== undefined)
            category.isPublished =
                payload.isPublished === "true" || payload.isPublished === true;
        await category.save();
        return (0, image_resolver_plugin_1.resolveImageUrls)(category, ["icon", "banner"]);
    },
    async delete(id) {
        if (!mongoose_1.default.isValidObjectId(id))
            throw new ApiError_1.ApiError(400, "Invalid category ID");
        const category = await category_model_1.Category.findByIdAndDelete(id);
        if (!category)
            throw new ApiError_1.ApiError(404, "Category not found");
        if (category.icon)
            await file_service_1.fileService.deleteFile("categories/icons", category.icon.split("/").pop());
        if (category.banner)
            await file_service_1.fileService.deleteFile("categories/banners", category.banner.split("/").pop());
        return { message: "Category deleted" };
    },
    async deleteMultiple(ids) {
        const validIds = ids.filter(mongoose_1.default.isValidObjectId);
        const categories = await category_model_1.Category.find({ _id: { $in: validIds } });
        await Promise.all(categories.map(async (cat) => {
            if (cat.icon)
                await file_service_1.fileService.deleteFile("categories/icons", cat.icon.split("/").pop());
            if (cat.banner)
                await file_service_1.fileService.deleteFile("categories/banners", cat.banner.split("/").pop());
        }));
        const res = await category_model_1.Category.deleteMany({ _id: { $in: validIds } });
        return res.deletedCount;
    },
    async togglePublished(id) {
        const cat = await category_model_1.Category.findById(id);
        if (!cat)
            throw new ApiError_1.ApiError(404, "Category not found");
        cat.isPublished = !cat.isPublished;
        await cat.save();
        return cat.isPublished;
    },
    async toggleFeatured(id) {
        const cat = await category_model_1.Category.findById(id);
        if (!cat)
            throw new ApiError_1.ApiError(404, "Category not found");
        if (!cat.isFeatured) {
            // Assign order when featuring
            const maxOrder = await category_model_1.Category.find({ isFeatured: true })
                .sort({ order: -1 })
                .limit(1);
            cat.order = maxOrder[0]?.order ? maxOrder[0].order + 1 : 1;
        }
        else {
            // Remove order when unfeaturing
            cat.order = 0;
        }
        cat.isFeatured = !cat.isFeatured;
        await cat.save();
        return cat.isFeatured;
    },
    async toggleMultiplePublished(ids, action) {
        return category_model_1.Category.updateMany({ _id: { $in: ids } }, { $set: { isPublished: action === "publish" } });
    },
    async toggleMultipleFeatured(ids, action) {
        return category_model_1.Category.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: action === "feature" } });
    },
    async getAll() {
        return category_model_1.Category.find()
            .populate("parent", "name slug icon banner")
            .sort({ createdAt: -1 });
    },
    async getAllCategories() {
        // return Category.find()
        //   .populate("parent", "name slug icon banner")
        //   .sort({ createdAt: -1 });
        const categories = await category_model_1.Category.aggregate([
            {
                $match: {
                    parent: null,
                },
            },
            //  Sort and limit the roots
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "categories",
                    let: { l1Id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$parent", "$$l1Id"] },
                                isPublished: true,
                            },
                        },
                        { $sort: { order: 1 } },
                        // --- LEVEL 3 ---
                        {
                            $lookup: {
                                from: "categories",
                                let: { l2Id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$parent", "$$l2Id"] },
                                            isPublished: true,
                                        },
                                    },
                                    { $sort: { order: 1 } },
                                    // --- LEVEL 4 ---
                                    {
                                        $lookup: {
                                            from: "categories",
                                            let: { l3Id: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ["$parent", "$$l3Id"] },
                                                        isPublished: true,
                                                    },
                                                },
                                                { $sort: { order: 1 } },
                                                // --- LEVEL 5 ---
                                                {
                                                    $lookup: {
                                                        from: "categories",
                                                        let: { l4Id: "$_id" },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ["$parent", "$$l4Id"] },
                                                                    isPublished: true,
                                                                },
                                                            },
                                                            { $sort: { order: 1 } },
                                                            // --- LEVEL 6 (Deepest) ---
                                                            {
                                                                $lookup: {
                                                                    from: "categories",
                                                                    let: { l5Id: "$_id" },
                                                                    pipeline: [
                                                                        {
                                                                            $match: {
                                                                                $expr: { $eq: ["$parent", "$$l5Id"] },
                                                                                isPublished: true,
                                                                            },
                                                                        },
                                                                        { $sort: { order: 1 } },
                                                                        // Project fields for LEVEL 6
                                                                        {
                                                                            $project: {
                                                                                _id: 1,
                                                                                name: 1,
                                                                                slug: 1,
                                                                                icon: 1,
                                                                                banner: 1,
                                                                                order: 1,
                                                                            },
                                                                        },
                                                                    ],
                                                                    as: "children",
                                                                },
                                                            },
                                                            // Project fields for LEVEL 5 (must include children: 1)
                                                            {
                                                                $project: {
                                                                    _id: 1,
                                                                    name: 1,
                                                                    slug: 1,
                                                                    icon: 1,
                                                                    banner: 1,
                                                                    order: 1,
                                                                    children: 1,
                                                                },
                                                            },
                                                        ],
                                                        as: "children",
                                                    },
                                                },
                                                // Project fields for LEVEL 4 (must include children: 1)
                                                {
                                                    $project: {
                                                        _id: 1,
                                                        name: 1,
                                                        slug: 1,
                                                        icon: 1,
                                                        banner: 1,
                                                        order: 1,
                                                        children: 1,
                                                    },
                                                },
                                            ],
                                            as: "children",
                                        },
                                    },
                                    // Project fields for LEVEL 3 (must include children: 1)
                                    {
                                        $project: {
                                            _id: 1,
                                            name: 1,
                                            slug: 1,
                                            icon: 1,
                                            banner: 1,
                                            order: 1,
                                            children: 1,
                                        },
                                    },
                                ],
                                as: "children",
                            },
                        },
                        // Project fields for LEVEL 2 (must include children: 1)
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                slug: 1,
                                icon: 1,
                                banner: 1,
                                order: 1,
                                children: 1,
                            },
                        },
                    ],
                    as: "children",
                },
            },
            //  Filter fields for PARENTS (and keep the children array)
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    icon: 1,
                    banner: 1,
                    order: 1,
                    children: 1,
                },
            },
        ]);
        return (0, image_resolver_plugin_1.resolveImageUrls)(categories, [
            "icon",
            "banner",
            "children.icon",
            "children.banner",
            "children.children.icon", // Level 3
            "children.children.banner",
            "children.children.children.icon", // Level 4
            "children.children.children.banner",
            "children.children.children.children.icon", // Level 5
            "children.children.children.children.banner",
            "children.children.children.children.children.icon", // Level 6
            "children.children.children.children.children.banner",
        ]);
    },
    async getFeaturedPublished(limit = 10) {
        const categories = await category_model_1.Category.aggregate([
            // --- LEVEL 1 (Roots) ---
            {
                $match: {
                    parent: null,
                    //isFeatured: true,
                    isPublished: true,
                },
            },
            { $sort: { order: 1, createdAt: 1 } },
            // --- LEVEL 2 ---
            {
                $lookup: {
                    from: "categories",
                    let: { l1Id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$parent", "$$l1Id"] },
                                isPublished: true,
                            },
                        },
                        { $sort: { order: 1 } },
                        // --- LEVEL 3 ---
                        {
                            $lookup: {
                                from: "categories",
                                let: { l2Id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$parent", "$$l2Id"] },
                                            isPublished: true,
                                        },
                                    },
                                    { $sort: { order: 1 } },
                                    // --- LEVEL 4 ---
                                    {
                                        $lookup: {
                                            from: "categories",
                                            let: { l3Id: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ["$parent", "$$l3Id"] },
                                                        isPublished: true,
                                                    },
                                                },
                                                { $sort: { order: 1 } },
                                                // --- LEVEL 5 ---
                                                {
                                                    $lookup: {
                                                        from: "categories",
                                                        let: { l4Id: "$_id" },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ["$parent", "$$l4Id"] },
                                                                    isPublished: true,
                                                                },
                                                            },
                                                            { $sort: { order: 1 } },
                                                            // --- LEVEL 6 (Deepest) ---
                                                            {
                                                                $lookup: {
                                                                    from: "categories",
                                                                    let: { l5Id: "$_id" },
                                                                    pipeline: [
                                                                        {
                                                                            $match: {
                                                                                $expr: { $eq: ["$parent", "$$l5Id"] },
                                                                                isPublished: true,
                                                                            },
                                                                        },
                                                                        { $sort: { order: 1 } },
                                                                        // Project fields for LEVEL 6
                                                                        {
                                                                            $project: {
                                                                                _id: 1,
                                                                                name: 1,
                                                                                slug: 1,
                                                                                icon: 1,
                                                                                banner: 1,
                                                                                order: 1,
                                                                            },
                                                                        },
                                                                    ],
                                                                    as: "children",
                                                                },
                                                            },
                                                            // Project fields for LEVEL 5 (must include children: 1)
                                                            {
                                                                $project: {
                                                                    _id: 1,
                                                                    name: 1,
                                                                    slug: 1,
                                                                    icon: 1,
                                                                    banner: 1,
                                                                    order: 1,
                                                                    children: 1,
                                                                },
                                                            },
                                                        ],
                                                        as: "children",
                                                    },
                                                },
                                                // Project fields for LEVEL 4 (must include children: 1)
                                                {
                                                    $project: {
                                                        _id: 1,
                                                        name: 1,
                                                        slug: 1,
                                                        icon: 1,
                                                        banner: 1,
                                                        order: 1,
                                                        children: 1,
                                                    },
                                                },
                                            ],
                                            as: "children",
                                        },
                                    },
                                    // Project fields for LEVEL 3 (must include children: 1)
                                    {
                                        $project: {
                                            _id: 1,
                                            name: 1,
                                            slug: 1,
                                            icon: 1,
                                            banner: 1,
                                            order: 1,
                                            children: 1,
                                        },
                                    },
                                ],
                                as: "children",
                            },
                        },
                        // Project fields for LEVEL 2 (must include children: 1)
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                slug: 1,
                                icon: 1,
                                banner: 1,
                                order: 1,
                                children: 1,
                            },
                        },
                    ],
                    as: "children",
                },
            },
            // Project fields for LEVEL 1 (must include children: 1)
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    icon: 1,
                    banner: 1,
                    order: 1,
                    children: 1,
                },
            },
        ]);
        // Resolve images for all 6 levels
        return (0, image_resolver_plugin_1.resolveImageUrls)(categories, [
            "icon", // Level 1
            "banner",
            "children.icon", // Level 2
            "children.banner",
            "children.children.icon", // Level 3
            "children.children.banner",
            "children.children.children.icon", // Level 4
            "children.children.children.banner",
            "children.children.children.children.icon", // Level 5
            "children.children.children.children.banner",
            "children.children.children.children.children.icon", // Level 6
            "children.children.children.children.children.banner",
        ]);
    },
    async reorderFeatured(orders) {
        const bulkOps = orders.map((item) => ({
            updateOne: {
                filter: { _id: new mongoose_1.default.Types.ObjectId(item.id) },
                update: {
                    $set: {
                        order: item.order,
                        parent: item.parentId
                            ? new mongoose_1.default.Types.ObjectId(item.parentId)
                            : null,
                    },
                },
            },
        }));
        await category_model_1.Category.bulkWrite(bulkOps);
        return { message: "Featured categories reordered" };
    },
    async importCategories(filePath, ext) {
        const rows = [];
        if (ext === "json") {
            const raw = await fs_1.default.promises.readFile(filePath, "utf-8");
            const parsed = JSON.parse(raw);
            for (const c of parsed) {
                const slug = await generateUniqueSlug(c.name);
                await category_model_1.Category.create({
                    name: c.name,
                    slug,
                    description: c.description || "",
                    parent: null,
                    icon: c.icon || "",
                    banner: c.banner || "",
                    isFeatured: !!c.isFeatured,
                    isPublished: !!c.isPublished,
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
                await category_model_1.Category.create({
                    name: row.Name,
                    slug,
                    description: row.Description || "",
                    parent: null,
                    icon: row.Icon || "",
                    banner: row.Banner || "",
                    isFeatured: row.Featured === "true",
                    isPublished: row.Published === "true",
                });
            }
            await fs_1.default.promises.unlink(filePath);
            return rows.length;
        }
        throw new ApiError_1.ApiError(400, "Unsupported file format");
    },
};
