import mongoose from "mongoose";
import slugify from "slugify";
import fs from "fs";
import csv from "csv-parser";
import { Category } from "../models/category.model";
import { fileService } from "./utils/file.service";
import { resolveImageUrls } from "../utils/image-resolver.plugin";
import { ApiError } from "../utils/ApiError";

interface UploadedFiles {
  icon?: Express.Multer.File[];
  banner?: Express.Multer.File[];
}

// ---------------------- Helper ----------------------
async function generateUniqueSlug(name: string, excludeId?: string) {
  let baseSlug = slugify(name, { lower: true, strict: true });
  if (!baseSlug) baseSlug = `category-${Date.now()}`;

  let slug = baseSlug;
  let exists = await Category.findOne({ slug, _id: { $ne: excludeId } });

  while (exists) {
    slug = `${baseSlug}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
    exists = await Category.findOne({ slug, _id: { $ne: excludeId } });
  }

  return slug;
}

// ---------------------- Service ----------------------
export const categoryService = {
  async create(payload: any, files?: UploadedFiles) {
    const { name, description, parent, isFeatured, isPublished } = payload;
    if (!name) throw new ApiError(400, "Category name is required");

    const slug = await generateUniqueSlug(name);

    let icon = "";
    let banner = "";

    if (files?.icon?.[0]) {
      const f = files.icon[0];
      const fileName = fileService.generateFileName(f.originalname, slug);
      await fileService.moveFile(f, "categories/icons", fileName);
      icon = fileService.getFileUrl("categories/icons", fileName);
    }

    if (files?.banner?.[0]) {
      const f = files.banner[0];
      const fileName = fileService.generateFileName(f.originalname, slug);
      await fileService.moveFile(f, "categories/banners", fileName);
      banner = fileService.getFileUrl("categories/banners", fileName);
    }

    const parentCategory = parent ? await Category.findById(parent) : null;

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parentCategory?._id || null,
      icon,
      banner,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isPublished: isPublished === "true" || isPublished === true,
    });

    return resolveImageUrls(category, ["icon", "banner"]);
  },

  async update(id: string, payload: any, files?: UploadedFiles) {
    if (!mongoose.isValidObjectId(id))
      throw new ApiError(400, "Invalid category ID");

    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found");

    const name = payload.name ?? category.name;
    category.slug = await generateUniqueSlug(name, id);

    if (files?.icon?.[0]) {
      if (category.icon)
        await fileService.deleteFile(
          "categories/icons",
          category.icon.split("/").pop()!,
        );
      const f = files.icon[0];
      const fileName = fileService.generateFileName(
        f.originalname,
        category.slug,
      );
      await fileService.moveFile(f, "categories/icons", fileName);
      category.icon = fileService.getFileUrl("categories/icons", fileName);
    }

    if (files?.banner?.[0]) {
      if (category.banner)
        await fileService.deleteFile(
          "categories/banners",
          category.banner.split("/").pop()!,
        );
      const f = files.banner[0];
      const fileName = fileService.generateFileName(
        f.originalname,
        category.slug,
      );
      await fileService.moveFile(f, "categories/banners", fileName);
      category.banner = fileService.getFileUrl("categories/banners", fileName);
    }

    if (payload.name) category.name = payload.name;
    if (payload.description !== undefined)
      category.description = payload.description;
    if (payload.parent !== undefined) category.parent = payload.parent || null;
    if (payload.isFeatured !== undefined)
      category.isFeatured =
        payload.isFeatured === "true" || payload.isFeatured === true;
    if (payload.isPublished !== undefined)
      category.isPublished =
        payload.isPublished === "true" || payload.isPublished === true;

    await category.save();
    return resolveImageUrls(category, ["icon", "banner"]);
  },

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id))
      throw new ApiError(400, "Invalid category ID");

    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new ApiError(404, "Category not found");

    if (category.icon)
      await fileService.deleteFile(
        "categories/icons",
        category.icon.split("/").pop()!,
      );
    if (category.banner)
      await fileService.deleteFile(
        "categories/banners",
        category.banner.split("/").pop()!,
      );

    return { message: "Category deleted" };
  },

  async deleteMultiple(ids: string[]) {
    const validIds = ids.filter(mongoose.isValidObjectId);
    const categories = await Category.find({ _id: { $in: validIds } });

    await Promise.all(
      categories.map(async (cat) => {
        if (cat.icon)
          await fileService.deleteFile(
            "categories/icons",
            cat.icon.split("/").pop()!,
          );
        if (cat.banner)
          await fileService.deleteFile(
            "categories/banners",
            cat.banner.split("/").pop()!,
          );
      }),
    );

    const res = await Category.deleteMany({ _id: { $in: validIds } });
    return res.deletedCount;
  },

  async togglePublished(id: string) {
    const cat = await Category.findById(id);
    if (!cat) throw new ApiError(404, "Category not found");
    cat.isPublished = !cat.isPublished;
    await cat.save();
    return cat.isPublished;
  },

  async toggleFeatured(id: string) {
    const cat = await Category.findById(id);
    if (!cat) throw new ApiError(404, "Category not found");
    if (!cat.isFeatured) {
      // Assign order when featuring
      const maxOrder = await Category.find({ isFeatured: true })
        .sort({ order: -1 })
        .limit(1);

      cat.order = maxOrder[0]?.order ? maxOrder[0].order + 1 : 1;
    } else {
      // Remove order when unfeaturing
      cat.order = 0;
    }
    cat.isFeatured = !cat.isFeatured;
    await cat.save();
    return cat.isFeatured;
  },

  async toggleMultiplePublished(
    ids: string[],
    action: "publish" | "unpublish",
  ) {
    return Category.updateMany(
      { _id: { $in: ids } },
      { $set: { isPublished: action === "publish" } },
    );
  },

  async toggleMultipleFeatured(ids: string[], action: "feature" | "unfeature") {
    return Category.updateMany(
      { _id: { $in: ids } },
      { $set: { isFeatured: action === "feature" } },
    );
  },
  async getAll() {
    return Category.find()
      .populate("parent", "name slug icon banner")
      .sort({ createdAt: -1 });
  },
  async getAllCategories() {
    // return Category.find()
    //   .populate("parent", "name slug icon banner")
    //   .sort({ createdAt: -1 });
    const categories = await Category.aggregate([
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

    return resolveImageUrls(categories, [
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
    const categories = await Category.aggregate([
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
    return resolveImageUrls(categories, [
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

  async reorderFeatured(
    orders: { id: string; order: number; parentId: string | null }[],
  ) {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id) },
        update: {
          $set: {
            order: item.order,
            parent: item.parentId
              ? new mongoose.Types.ObjectId(item.parentId)
              : null,
          },
        },
      },
    }));

    await Category.bulkWrite(bulkOps);

    return { message: "Featured categories reordered" };
  },

  async importCategories(filePath: string, ext: string) {
    const rows: any[] = [];

    if (ext === "json") {
      const raw = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);

      for (const c of parsed) {
        const slug = await generateUniqueSlug(c.name);
        await Category.create({
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
        await Category.create({
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

      await fs.promises.unlink(filePath);
      return rows.length;
    }

    throw new ApiError(400, "Unsupported file format");
  },
};
