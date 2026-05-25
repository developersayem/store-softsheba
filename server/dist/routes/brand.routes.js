"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const brand_controller_1 = require("../controllers/brand.controller");
const router = (0, express_1.Router)();
// Create
router.post("/", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("brands").single("image"), brand_controller_1.createBrand);
// Read
router.get("/", brand_controller_1.getAllBrands);
// Delete
router.delete("/:id", auth_middleware_1.verifyJWT, brand_controller_1.deleteBrand);
router.post("/delete-many", auth_middleware_1.verifyJWT, brand_controller_1.deleteMultipleBrands);
// Toggle multiple
router.patch("/toggle-multiple-published", auth_middleware_1.verifyJWT, brand_controller_1.toggleMultiplePublished);
router.patch("/toggle-multiple-featured", auth_middleware_1.verifyJWT, brand_controller_1.toggleMultipleFeatured);
// Toggle
router.patch("/:id/toggle-published", auth_middleware_1.verifyJWT, brand_controller_1.togglePublished);
router.patch("/:id/toggle-featured", auth_middleware_1.verifyJWT, brand_controller_1.toggleFeatured);
// Update
router.patch("/:id", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("brands").single("image"), brand_controller_1.updateBrand);
// Import
router.post("/import", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("temp").single("file"), brand_controller_1.importBrands);
exports.default = router;
