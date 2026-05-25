"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const collection_controller_1 = require("../controllers/collection.controller");
const router = (0, express_1.Router)();
// Create a new collection (Admin only)
router.post("/", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("collections").single("image"), collection_controller_1.createCollection);
// Get all collections (Public)
router.get("/", collection_controller_1.getAllCollections);
// Get all collections with products (Public)
router.get("/with-products", collection_controller_1.getAllCollectionsWithProducts);
// Get products by collection slug (Public)
router.get("/:slug/products", collection_controller_1.getProductsByCollection);
// Update an existing collection (Admin only)
router.put("/:id", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("collections").single("image"), collection_controller_1.updateCollection);
//reorder collections (Admin only)
router.patch("/reorder/all", auth_middleware_1.verifyJWT, collection_controller_1.collectionReorder);
// Delete a collection (Admin only)
router.delete("/:id", auth_middleware_1.verifyJWT, collection_controller_1.deleteCollection);
// Delete multiple collections (Admin only)
router.post("/delete-many", auth_middleware_1.verifyJWT, collection_controller_1.deleteMultipleCollections);
// Toggle published/unpublished state (Admin only)
router.patch("/:id/toggle-published", auth_middleware_1.verifyJWT, collection_controller_1.togglePublished);
// Toggle published/unpublished state (Admin only)
router.patch("/:id/toggle-featured", auth_middleware_1.verifyJWT, collection_controller_1.toggleFeatured);
// Toggle published/unpublished state for multiple collections (Admin only)
router.patch("/toggle-multiple-published", auth_middleware_1.verifyJWT, collection_controller_1.toggleMultiplePublished);
// Toggle featured/un-featured state for multiple collections (Admin only)
router.patch("/toggle-multiple-featured", auth_middleware_1.verifyJWT, collection_controller_1.toggleMultipleFeatured);
// Import collections from JSON or CSV (Admin only)
router.post("/import", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("temp").single("file"), collection_controller_1.importCollections);
exports.default = router;
