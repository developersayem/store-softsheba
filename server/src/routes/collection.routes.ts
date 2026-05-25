import { Router } from "express";
import { uploadTo } from "../middlewares/upload.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createCollection,
  getAllCollections,
  getAllCollectionsWithProducts,
  getProductsByCollection,
  updateCollection,
  deleteCollection,
  deleteMultipleCollections,
  importCollections,
  togglePublished,
  toggleFeatured,
  toggleMultiplePublished,
  toggleMultipleFeatured,
  collectionReorder,
} from "../controllers/collection.controller";

const router = Router();


// Create a new collection (Admin only)
router.post(
  "/",
  verifyJWT,
  uploadTo("collections").single("image"),
  createCollection
);

// Get all collections (Public)
router.get("/", getAllCollections);

// Get all collections with products (Public)
router.get("/with-products", getAllCollectionsWithProducts);

// Get products by collection slug (Public)
router.get("/:slug/products", getProductsByCollection);

// Update an existing collection (Admin only)
router.put(
  "/:id",
  verifyJWT,
  uploadTo("collections").single("image"),
  updateCollection
);
//reorder collections (Admin only)
router.patch("/reorder/all", verifyJWT, collectionReorder);
// Delete a collection (Admin only)
router.delete("/:id", verifyJWT, deleteCollection);

// Delete multiple collections (Admin only)
router.post("/delete-many", verifyJWT, deleteMultipleCollections);

// Toggle published/unpublished state (Admin only)
router.patch("/:id/toggle-published", verifyJWT, togglePublished);

// Toggle published/unpublished state (Admin only)
router.patch("/:id/toggle-featured", verifyJWT, toggleFeatured);

// Toggle published/unpublished state for multiple collections (Admin only)
router.patch(
  "/toggle-multiple-published",
  verifyJWT,
  toggleMultiplePublished
);

// Toggle featured/un-featured state for multiple collections (Admin only)
router.patch(
  "/toggle-multiple-featured",
  verifyJWT,
  toggleMultipleFeatured
);


// Import collections from JSON or CSV (Admin only)
router.post(
  "/import",
  verifyJWT,
  uploadTo("temp").single("file"),
  importCollections
);

export default router;
