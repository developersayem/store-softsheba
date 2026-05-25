import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { categoryService } from "../services/category.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Category } from "../models/category.model";

// =============================
// CREATE CATEGORY
// =============================
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body, req.files as any);

    res
      .status(201)
      .json(new ApiResponse(201, category, "Category created successfully"));
  }
);

// =============================
// GET ALL CATEGORIES for dashboard
// =============================
export const getAllCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAll();
    res.json(new ApiResponse(200, categories));
  }
);

export const getAll = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    res.json(new ApiResponse(200, categories));
  }
);

// =============================
// GET FEATURED PUBLISHED CATEGORIES
// =============================
export const getFeaturedPublishedCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;

    const categories = await categoryService.getFeaturedPublished(limit);

    res.json(new ApiResponse(200, categories));
  }
);
//re-ordered featured categories
export const reorderFeaturedCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.reorderFeatured(req.body.orders);
    res.json(new ApiResponse(200, result));
  }
);

// =============================
// GET CATEGORY BY SLUG
// =============================
export const getCategoryBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).populate(
      "parent",
      "name slug icon banner"
    );

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.json(new ApiResponse(200, category));
  }
);

// =============================
// UPDATE CATEGORY
// =============================
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const updated = await categoryService.update(
      req.params.id as string,
      req.body,
      req.files as any
    );

    res.json(new ApiResponse(200, updated, "Category updated successfully"));
  }
);

// =============================
// DELETE CATEGORY
// =============================
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.delete(req.params.id as string);

    res.json(new ApiResponse(200, null, result.message));
  }
);

// =============================
// DELETE MULTIPLE CATEGORIES
// =============================
export const deleteMultipleCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, "ids array is required");
    }

    const count = await categoryService.deleteMultiple(ids);

    res.json(
      new ApiResponse(200, null, `${count} categories deleted successfully`)
    );
  }
);

// =============================
// TOGGLE PUBLISHED (SINGLE)
// =============================
export const togglePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await categoryService.togglePublished(
      req.params.id as string
    );

    res.json(
      new ApiResponse(
        200,
        null,
        status ? "Category published" : "Category unpublished"
      )
    );
  }
);

// =============================
// TOGGLE FEATURED (SINGLE)
// =============================
export const toggleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await categoryService.toggleFeatured(
      req.params.id as string
    );

    res.json(
      new ApiResponse(
        200,
        null,
        status ? "Category featured" : "Category unfeatured"
      )
    );
  }
);

// =============================
// TOGGLE MULTIPLE PUBLISHED
// =============================
export const toggleMultiplePublished = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || !["publish", "unpublish"].includes(action)) {
      throw new ApiError(400, "Invalid ids or action");
    }

    await categoryService.toggleMultiplePublished(ids, action);

    res.json(
      new ApiResponse(
        200,
        null,
        `Categories ${
          action === "publish" ? "published" : "unpublished"
        } successfully`
      )
    );
  }
);

// =============================
// TOGGLE MULTIPLE FEATURED
// =============================
export const toggleMultipleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || !["feature", "unfeature"].includes(action)) {
      throw new ApiError(400, "Invalid ids or action");
    }

    await categoryService.toggleMultipleFeatured(ids, action);

    res.json(
      new ApiResponse(
        200,
        null,
        `Categories ${
          action === "feature" ? "featured" : "unfeatured"
        } successfully`
      )
    );
  }
);

// =============================
// IMPORT CATEGORIES (CSV / JSON)
// =============================
export const importCategories = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const ext = req.file.originalname.split(".").pop()?.toLowerCase();

    if (!ext) {
      throw new ApiError(400, "Invalid file");
    }

    const count = await categoryService.importCategories(req.file.path, ext);

    res.json(
      new ApiResponse(200, null, `${count} categories imported successfully`)
    );
  }
);
