"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandService = void 0;
const brand_model_1 = require("../models/brand.model");
const file_service_1 = require("./utils/file.service");
const image_resolver_plugin_1 = require("../utils/image-resolver.plugin");
const ApiError_1 = require("../utils/ApiError");
const slugify_1 = __importDefault(require("slugify"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
// ---------------------- Helper ----------------------
async function generateUniqueSlug(name, excludeId) {
    let baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true });
    if (!baseSlug)
        baseSlug = `brand-${Date.now()}`;
    let slug = baseSlug;
    let exists = await brand_model_1.Brand.findOne({ slug, _id: { $ne: excludeId } });
    while (exists) {
        slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
        exists = await brand_model_1.Brand.findOne({ slug, _id: { $ne: excludeId } });
    }
    return slug;
}
// ---------------------- Service ----------------------
exports.brandService = {
    async create(payload, file) {
        const { name, isFeatured, isPublished } = payload;
        if (!name)
            throw new ApiError_1.ApiError(400, "Brand name is required");
        const slug = await generateUniqueSlug(name);
        let imageUrl = "";
        if (file) {
            const customName = file_service_1.fileService.generateFileName(file.originalname, slug);
            await file_service_1.fileService.moveFile(file, "brands", customName);
            imageUrl = file_service_1.fileService.getFileUrl("brands", customName);
        }
        const brand = await brand_model_1.Brand.create({
            name,
            slug,
            image: imageUrl,
            isFeatured: isFeatured === "true" || isFeatured === true,
            isPublished: isPublished === "true" || isPublished === true,
        });
        return (0, image_resolver_plugin_1.resolveImageUrls)(brand, ["image"]);
    },
    async update(id, payload, file) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid brand ID");
        const brand = await brand_model_1.Brand.findById(id);
        if (!brand)
            throw new ApiError_1.ApiError(404, "Brand not found");
        if (file) {
            if (brand.image) {
                const oldFile = brand.image.split("/").pop();
                if (oldFile)
                    await file_service_1.fileService.deleteFile("brands", oldFile);
            }
            const slug = await generateUniqueSlug(payload.name || brand.name, id);
            const customName = file_service_1.fileService.generateFileName(file.originalname, slug);
            await file_service_1.fileService.moveFile(file, "brands", customName);
            brand.image = file_service_1.fileService.getFileUrl("brands", customName);
            brand.slug = slug;
        }
        if (payload.name && payload.name !== brand.name) {
            brand.name = payload.name;
            brand.slug = await generateUniqueSlug(payload.name, id);
        }
        if (payload.isFeatured !== undefined)
            brand.isFeatured =
                payload.isFeatured === "true" || payload.isFeatured === true;
        if (payload.isPublished !== undefined)
            brand.isPublished =
                payload.isPublished === "true" || payload.isPublished === true;
        await brand.save();
        return (0, image_resolver_plugin_1.resolveImageUrls)(brand, ["image"]);
    },
    async delete(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid brand ID");
        const brand = await brand_model_1.Brand.findByIdAndDelete(id);
        if (!brand)
            throw new ApiError_1.ApiError(404, "Brand not found");
        if (brand.image) {
            const oldFile = brand.image.split("/").pop();
            if (oldFile)
                await file_service_1.fileService.deleteFile("brands", oldFile);
        }
        return { message: "Brand deleted" };
    },
    async deleteMultiple(ids) {
        if (!Array.isArray(ids) || ids.length === 0)
            throw new ApiError_1.ApiError(400, "IDs array required");
        const validIds = ids.filter((id) => mongoose_1.default.isValidObjectId(id));
        const brands = await brand_model_1.Brand.find({ _id: { $in: validIds } });
        await Promise.all(brands.map(async (b) => {
            if (b.image) {
                const oldFile = b.image.split("/").pop();
                if (oldFile)
                    await file_service_1.fileService.deleteFile("brands", oldFile);
            }
        }));
        const result = await brand_model_1.Brand.deleteMany({ _id: { $in: validIds } });
        return result.deletedCount;
    },
    async togglePublished(id) {
        const brand = await brand_model_1.Brand.findById(id);
        if (!brand)
            throw new ApiError_1.ApiError(404, "Brand not found");
        brand.isPublished = !brand.isPublished;
        await brand.save();
        return brand.isPublished;
    },
    async toggleFeatured(id) {
        const brand = await brand_model_1.Brand.findById(id);
        if (!brand)
            throw new ApiError_1.ApiError(404, "Brand not found");
        brand.isFeatured = !brand.isFeatured;
        await brand.save();
        return brand.isFeatured;
    },
    async toggleMultiplePublished(ids, action) {
        const isPublished = action === "publish";
        await brand_model_1.Brand.updateMany({ _id: { $in: ids } }, { $set: { isPublished } });
        return isPublished;
    },
    async toggleMultipleFeatured(ids, action) {
        const isFeatured = action === "feature";
        await brand_model_1.Brand.updateMany({ _id: { $in: ids } }, { $set: { isFeatured } });
        return isFeatured;
    },
    async getAll() {
        const brands = await brand_model_1.Brand.find().sort({ createdAt: -1 }).lean();
        return (0, image_resolver_plugin_1.resolveImageUrls)(brands, ["image"]);
    },
    async importBrands(filePath, ext) {
        const results = [];
        if (ext === "json") {
            const raw = await fs_1.default.promises.readFile(filePath, "utf-8");
            const parsed = JSON.parse(raw);
            await Promise.all(parsed.map(async (b) => {
                const slug = await generateUniqueSlug(b.name);
                await brand_model_1.Brand.create({
                    name: b.name,
                    slug,
                    image: b.image || "",
                    isFeatured: b.isFeatured === "true" || b.isFeatured === true,
                    isPublished: b.isPublished === "true" || b.isPublished === true,
                    createdAt: b.createdAt || new Date(),
                    updatedAt: b.updatedAt || new Date(),
                });
            }));
            await fs_1.default.promises.unlink(filePath).catch(() => { });
            return parsed.length;
        }
        if (ext === "csv") {
            await new Promise((resolve, reject) => {
                fs_1.default.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)())
                    .on("data", (row) => results.push(row))
                    .on("end", resolve)
                    .on("error", reject);
            });
            for (const row of results) {
                const slug = await generateUniqueSlug(row.Name);
                await brand_model_1.Brand.create({
                    name: row.Name,
                    slug,
                    image: row.image,
                    isFeatured: row.Featured === "true",
                    isPublished: row.Published === "true",
                    createdAt: row["Created At"] || new Date(),
                    updatedAt: row["Updated At"] || new Date(),
                });
            }
            await fs_1.default.promises.unlink(filePath).catch(() => { });
            return results.length;
        }
        throw new ApiError_1.ApiError(400, "Unsupported file format");
    },
};
