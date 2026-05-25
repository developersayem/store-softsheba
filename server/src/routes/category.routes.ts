import { Router } from "express";
import { uploadTo } from "../middlewares/upload.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories,
  importCategories,
  togglePublished,
  toggleFeatured,
  toggleMultiplePublished,
  toggleMultipleFeatured,
  getFeaturedPublishedCategories,
  reorderFeaturedCategories,
  getAll,
} from "../controllers/category.controller";

const router = Router();

/**
 * =============================
 * PUBLIC ROUTES
 * =============================
 */

// Get all categories
router.get("/", getAllCategories);
router.get("/all/cat", getAll);
// Get featured & published categories
router.get("/featured", getFeaturedPublishedCategories);

// Get category by slug
router.get("/slug/:slug", getCategoryBySlug);
// 👆 explicit path, no collisions

/**
 * =============================
 * ADMIN ROUTES
 * =============================
 */

// Create category
router.post(
  "/",
  verifyJWT,
  uploadTo("categories").fields([
    { name: "icon", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createCategory
);

// Update category
router.put(
  "/:id",
  verifyJWT,
  uploadTo("categories").fields([
    { name: "icon", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateCategory
);

// Delete single category
router.delete("/:id", verifyJWT, deleteCategory);

// Delete multiple categories
router.post("/delete-many", verifyJWT, deleteMultipleCategories);

// Toggle published (single)
router.patch("/:id/toggle-published", verifyJWT, togglePublished);

// Toggle featured (single)
router.patch("/:id/toggle-featured", verifyJWT, toggleFeatured);

//reordered feature
router.patch("/reorder-featured",verifyJWT,reorderFeaturedCategories)

// Toggle published (multiple)
router.patch("/toggle-multiple-published", verifyJWT, toggleMultiplePublished);

// Toggle featured (multiple)
router.patch("/toggle-multiple-featured", verifyJWT, toggleMultipleFeatured);

// Import categories
router.post(
  "/import",
  verifyJWT,
  uploadTo("temp").single("file"),
  importCategories
);

export default router;
