"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCategories = exports.toggleMultipleFeatured = exports.toggleMultiplePublished = exports.toggleFeatured = exports.togglePublished = exports.deleteMultipleCategories = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.reorderFeaturedCategories = exports.getFeaturedPublishedCategories = exports.getAll = exports.getAllCategories = exports.createCategory = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const category_service_1 = require("../services/category.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const category_model_1 = require("../models/category.model");
// =============================
// CREATE CATEGORY
// =============================
exports.createCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const category = await category_service_1.categoryService.create(req.body, req.files);
    res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, category, "Category created successfully"));
});
// =============================
// GET ALL CATEGORIES for dashboard
// =============================
exports.getAllCategories = (0, asyncHandler_1.default)(async (_req, res) => {
    const categories = await category_service_1.categoryService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, categories));
});
exports.getAll = (0, asyncHandler_1.default)(async (_req, res) => {
    const categories = await category_service_1.categoryService.getAllCategories();
    res.json(new ApiResponse_1.ApiResponse(200, categories));
});
// =============================
// GET FEATURED PUBLISHED CATEGORIES
// =============================
exports.getFeaturedPublishedCategories = (0, asyncHandler_1.default)(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const categories = await category_service_1.categoryService.getFeaturedPublished(limit);
    res.json(new ApiResponse_1.ApiResponse(200, categories));
});
//re-ordered featured categories
exports.reorderFeaturedCategories = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await category_service_1.categoryService.reorderFeatured(req.body.orders);
    res.json(new ApiResponse_1.ApiResponse(200, result));
});
// =============================
// GET CATEGORY BY SLUG
// =============================
exports.getCategoryBySlug = (0, asyncHandler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const category = await category_model_1.Category.findOne({ slug }).populate("parent", "name slug icon banner");
    if (!category) {
        throw new ApiError_1.ApiError(404, "Category not found");
    }
    res.json(new ApiResponse_1.ApiResponse(200, category));
});
// =============================
// UPDATE CATEGORY
// =============================
exports.updateCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const updated = await category_service_1.categoryService.update(req.params.id, req.body, req.files);
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Category updated successfully"));
});
// =============================
// DELETE CATEGORY
// =============================
exports.deleteCategory = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await category_service_1.categoryService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, result.message));
});
// =============================
// DELETE MULTIPLE CATEGORIES
// =============================
exports.deleteMultipleCategories = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError_1.ApiError(400, "ids array is required");
    }
    const count = await category_service_1.categoryService.deleteMultiple(ids);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${count} categories deleted successfully`));
});
// =============================
// TOGGLE PUBLISHED (SINGLE)
// =============================
exports.togglePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await category_service_1.categoryService.togglePublished(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, status ? "Category published" : "Category unpublished"));
});
// =============================
// TOGGLE FEATURED (SINGLE)
// =============================
exports.toggleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const status = await category_service_1.categoryService.toggleFeatured(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, status ? "Category featured" : "Category unfeatured"));
});
// =============================
// TOGGLE MULTIPLE PUBLISHED
// =============================
exports.toggleMultiplePublished = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || !["publish", "unpublish"].includes(action)) {
        throw new ApiError_1.ApiError(400, "Invalid ids or action");
    }
    await category_service_1.categoryService.toggleMultiplePublished(ids, action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `Categories ${action === "publish" ? "published" : "unpublished"} successfully`));
});
// =============================
// TOGGLE MULTIPLE FEATURED
// =============================
exports.toggleMultipleFeatured = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || !["feature", "unfeature"].includes(action)) {
        throw new ApiError_1.ApiError(400, "Invalid ids or action");
    }
    await category_service_1.categoryService.toggleMultipleFeatured(ids, action);
    res.json(new ApiResponse_1.ApiResponse(200, null, `Categories ${action === "feature" ? "featured" : "unfeatured"} successfully`));
});
// =============================
// IMPORT CATEGORIES (CSV / JSON)
// =============================
exports.importCategories = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.ApiError(400, "No file uploaded");
    }
    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    if (!ext) {
        throw new ApiError_1.ApiError(400, "Invalid file");
    }
    const count = await category_service_1.categoryService.importCategories(req.file.path, ext);
    res.json(new ApiResponse_1.ApiResponse(200, null, `${count} categories imported successfully`));
});
