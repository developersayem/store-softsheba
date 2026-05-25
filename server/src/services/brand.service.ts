import { Brand } from "../models/brand.model";
import { fileService } from "./utils/file.service";
import { resolveImageUrls } from "../utils/image-resolver.plugin";
import { ApiError } from "../utils/ApiError";
import slugify from "slugify";
import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";

// ---------------------- Helper ----------------------
async function generateUniqueSlug(name: string, excludeId?: string) {
  let baseSlug = slugify(name, { lower: true, strict: true });
  if (!baseSlug) baseSlug = `brand-${Date.now()}`;

  let slug = baseSlug;
  let exists = await Brand.findOne({ slug, _id: { $ne: excludeId } });

  while (exists) {
    slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
    exists = await Brand.findOne({ slug, _id: { $ne: excludeId } });
  }

  return slug;
}

// ---------------------- Service ----------------------
export const brandService = {
  async create(payload: any, file?: Express.Multer.File) {
    const { name, isFeatured, isPublished } = payload;
    if (!name) throw new ApiError(400, "Brand name is required");

    const slug = await generateUniqueSlug(name);
    let imageUrl = "";

    if (file) {
      const customName = fileService.generateFileName(file.originalname, slug);
      await fileService.moveFile(file, "brands", customName);
      imageUrl = fileService.getFileUrl("brands", customName);
    }

    const brand = await Brand.create({
      name,
      slug,
      image: imageUrl,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isPublished: isPublished === "true" || isPublished === true,
    });

    return resolveImageUrls(brand, ["image"]);
  },

  async update(id: string, payload: any, file?: Express.Multer.File) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid brand ID");
    const brand = await Brand.findById(id);
    if (!brand) throw new ApiError(404, "Brand not found");

    if (file) {
      if (brand.image) {
        const oldFile = brand.image.split("/").pop();
        if (oldFile) await fileService.deleteFile("brands", oldFile);
      }
      const slug = await generateUniqueSlug(payload.name || brand.name, id);
      const customName = fileService.generateFileName(file.originalname, slug);
      await fileService.moveFile(file, "brands", customName);
      brand.image = fileService.getFileUrl("brands", customName);
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
    return resolveImageUrls(brand, ["image"]);
  },

  async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid brand ID");
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw new ApiError(404, "Brand not found");

    if (brand.image) {
      const oldFile = brand.image.split("/").pop();
      if (oldFile) await fileService.deleteFile("brands", oldFile);
    }

    return { message: "Brand deleted" };
  },

  async deleteMultiple(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new ApiError(400, "IDs array required");

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    const brands = await Brand.find({ _id: { $in: validIds } });

    await Promise.all(
      brands.map(async (b) => {
        if (b.image) {
          const oldFile = b.image.split("/").pop();
          if (oldFile) await fileService.deleteFile("brands", oldFile);
        }
      })
    );

    const result = await Brand.deleteMany({ _id: { $in: validIds } });
    return result.deletedCount;
  },

  async togglePublished(id: string) {
    const brand = await Brand.findById(id);
    if (!brand) throw new ApiError(404, "Brand not found");
    brand.isPublished = !brand.isPublished;
    await brand.save();
    return brand.isPublished;
  },

  async toggleFeatured(id: string) {
    const brand = await Brand.findById(id);
    if (!brand) throw new ApiError(404, "Brand not found");
    brand.isFeatured = !brand.isFeatured;
    await brand.save();
    return brand.isFeatured;
  },

  async toggleMultiplePublished(
    ids: string[],
    action: "publish" | "unpublish"
  ) {
    const isPublished = action === "publish";
    await Brand.updateMany({ _id: { $in: ids } }, { $set: { isPublished } });
    return isPublished;
  },

  async toggleMultipleFeatured(ids: string[], action: "feature" | "unfeature") {
    const isFeatured = action === "feature";
    await Brand.updateMany({ _id: { $in: ids } }, { $set: { isFeatured } });
    return isFeatured;
  },

  async getAll() {
    const brands = await Brand.find().sort({ createdAt: -1 }).lean();
    return resolveImageUrls(brands, ["image"]);
  },

  async importBrands(filePath: string, ext: string) {
    const results: any[] = [];
    if (ext === "json") {
      const raw = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);

      await Promise.all(
        parsed.map(async (b: any) => {
          const slug = await generateUniqueSlug(b.name);
          await Brand.create({
            name: b.name,
            slug,
            image: b.image || "",
            isFeatured: b.isFeatured === "true" || b.isFeatured === true,
            isPublished: b.isPublished === "true" || b.isPublished === true,
            createdAt: b.createdAt || new Date(),
            updatedAt: b.updatedAt || new Date(),
          });
        })
      );

      await fs.promises.unlink(filePath).catch(() => {});
      return parsed.length;
    }

    if (ext === "csv") {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => results.push(row))
          .on("end", resolve)
          .on("error", reject);
      });

      for (const row of results) {
        const slug = await generateUniqueSlug(row.Name);
        await Brand.create({
          name: row.Name,
          slug,
          image: row.image,
          isFeatured: row.Featured === "true",
          isPublished: row.Published === "true",
          createdAt: row["Created At"] || new Date(),
          updatedAt: row["Updated At"] || new Date(),
        });
      }

      await fs.promises.unlink(filePath).catch(() => {});
      return results.length;
    }

    throw new ApiError(400, "Unsupported file format");
  },
};
