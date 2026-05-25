import slugify from "slugify";
import { Attribute } from "../models/attribute.model";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

async function generateUniqueSlug(
  name: string,
  unit?: string,
  excludeId?: string
) {
  let baseSlug = slugify(name, { lower: true, strict: true });
  if (unit) {
    const unitSlug = slugify(unit, { lower: true, strict: true });
    baseSlug = `${baseSlug}-${unitSlug}`;
  }

  if (!baseSlug) baseSlug = `attr-${Date.now()}`;

  let slug = baseSlug;
  let exists = await Attribute.findOne({ slug, _id: { $ne: excludeId } });

  while (exists) {
    slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
    exists = await Attribute.findOne({ slug, _id: { $ne: excludeId } });
  }

  return slug;
}

export const attributeService = {
  async create(payload: any) {
    if (!payload.name) throw new ApiError(400, "Attribute name is required");

    // Pass unit to slug generator
    const slug = await generateUniqueSlug(payload.name, payload.unit);

    const attr = await Attribute.create({
      name: payload.name,
      slug,
      unit: payload.unit,
      values: payload.values || [],
      isActive: payload.isActive === "true" || payload.isActive === true,
    });

    return attr;
  },

  async update(id: string, payload: any) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid attribute id");

    const attr = await Attribute.findById(id);
    if (!attr) throw new ApiError(404, "Attribute not found");

    // Regenerate slug if Name OR Unit changes
    if (
      (payload.name && payload.name !== attr.name) ||
      (payload.unit !== undefined && payload.unit !== attr.unit)
    ) {
      const newName = payload.name || attr.name;
      const newUnit = payload.unit !== undefined ? payload.unit : attr.unit;

      attr.slug = await generateUniqueSlug(newName, newUnit, id);
    }

    if (payload.name) attr.name = payload.name;
    if (payload.unit !== undefined) attr.unit = payload.unit;
    if (payload.values !== undefined) attr.values = payload.values;
    if (payload.isActive !== undefined)
      attr.isActive = payload.isActive === "true" || payload.isActive === true;

    await attr.save();
    return attr;
  },

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid attribute id");
    const deleted = await Attribute.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Attribute not found");
    return deleted;
  },

  async deleteMultiple(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new ApiError(400, "IDs array required");
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const result = await Attribute.deleteMany({ _id: { $in: validIds } });
    return result.deletedCount;
  },

  async getAll(query: any) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { slug: { $regex: query.search, $options: "i" } },
      ];
    }
    if (query.status) filter.isActive = query.status === "active";
    // Sort by name for better DX
    return Attribute.find(filter).sort({ createdAt: -1 });
  },

  async toggleStatus(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid attribute id");
    const attr = await Attribute.findById(id);
    if (!attr) throw new ApiError(404, "Attribute not found");
    attr.isActive = !attr.isActive;
    await attr.save();
    return attr;
  },

  async toggleMultiple(ids: string[], action: "activate" | "deactivate") {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new ApiError(400, "IDs array required");
    const isActive = action === "activate";
    await Attribute.updateMany({ _id: { $in: ids } }, { $set: { isActive } });
    return isActive;
  },

  async importAttributes(filePath: string, ext: string) {
    const fs = require("fs");
    const csv = require("csv-parser");
    const results: any[] = [];

    try {
      if (ext === "json") {
        const raw = await fs.promises.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);

        const data = await Promise.all(
          parsed.map(async (attr: any) => ({
            name: attr.name,
            unit: attr.unit,
            slug: await generateUniqueSlug(attr.name, attr.unit),
            values: attr.values || [],
            isActive: attr.isActive === "true" || attr.isActive === true,
            createdAt: attr.createdAt || new Date(),
            updatedAt: attr.updatedAt || new Date(),
          }))
        );

        await Attribute.insertMany(data);
        await fs.promises.unlink(filePath).catch(() => {});
        return data.length;
      }

      if (ext === "csv") {
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row: any) => results.push(row))
            .on("end", resolve)
            .on("error", reject);
        });

        for (const row of results) {
          const slug = await generateUniqueSlug(row.Name, row.Unit);
          await Attribute.create({
            name: row.Name,
            unit: row.Unit,
            slug,
            values: row.Values ? row.Values.split("|") : [],
            isActive: row.Active === "true",
            createdAt: row["Created At"] || new Date(),
            updatedAt: row["Updated At"] || new Date(),
          });
        }

        await fs.promises.unlink(filePath).catch(() => {});
        return results.length;
      }

      throw new ApiError(400, "Unsupported file format");
    } catch {
      console.log("error on import attributes");
      throw new ApiError(500, "Failed to import attributes");
    }
  },
};
