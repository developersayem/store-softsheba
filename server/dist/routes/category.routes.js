"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
/**
 * =============================
 * PUBLIC ROUTES
 * =============================
 */
// Get all categories
router.get("/", category_controller_1.getAllCategories);
router.get("/all/cat", category_controller_1.getAll);
// Get featured & published categories
router.get("/featured", category_controller_1.getFeaturedPublishedCategories);
// Get category by slug
router.get("/slug/:slug", category_controller_1.getCategoryBySlug);
// 👆 explicit path, no collisions
/**
 * =============================
 * ADMIN ROUTES
 * =============================
 */
// Create category
router.post("/", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("categories").fields([
    { name: "icon", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]), category_controller_1.createCategory);
// Update category
router.put("/:id", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("categories").fields([
    { name: "icon", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]), category_controller_1.updateCategory);
// Delete single category
router.delete("/:id", auth_middleware_1.verifyJWT, category_controller_1.deleteCategory);
// Delete multiple categories
router.post("/delete-many", auth_middleware_1.verifyJWT, category_controller_1.deleteMultipleCategories);
// Toggle published (single)
router.patch("/:id/toggle-published", auth_middleware_1.verifyJWT, category_controller_1.togglePublished);
// Toggle featured (single)
router.patch("/:id/toggle-featured", auth_middleware_1.verifyJWT, category_controller_1.toggleFeatured);
//reordered feature
router.patch("/reorder-featured", auth_middleware_1.verifyJWT, category_controller_1.reorderFeaturedCategories);
// Toggle published (multiple)
router.patch("/toggle-multiple-published", auth_middleware_1.verifyJWT, category_controller_1.toggleMultiplePublished);
// Toggle featured (multiple)
router.patch("/toggle-multiple-featured", auth_middleware_1.verifyJWT, category_controller_1.toggleMultipleFeatured);
// Import categories
router.post("/import", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("temp").single("file"), category_controller_1.importCategories);
exports.default = router;
