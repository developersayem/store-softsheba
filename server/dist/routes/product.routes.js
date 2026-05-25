"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/product.routes.ts
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", product_controller_1.listActiveProducts);
router.get("/all", product_controller_1.listAllProducts);
router.get("/flash-sale", product_controller_1.listAllActiveFlashSaleProducts);
router.get("/slug/:slug", product_controller_1.getProductBySlug);
router.get("/:id", product_controller_1.getProductById);
router.get("/:id/with-all-variants", product_controller_1.getProductByIdWithAllVariants);
router.get("/search-products/suggestions", product_controller_1.getProductSearchController);
// Protected admin routes
router.post("/", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), (0, upload_middleware_1.uploadTo)("products").any(), product_controller_1.createProduct);
router.put("/:id", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), (0, upload_middleware_1.uploadTo)("products").any(), product_controller_1.updateProduct);
router.get("/offers/products", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:view"), product_controller_1.listAllProductsWithOffers);
router.delete("/:id", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.deleteProduct);
router.post("/delete-many", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.deleteMultiple);
router.patch("/:id/toggle-publish", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.togglePublished);
router.patch("/toggle-multiple-publish", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.toggleMultiplePublished);
router.patch("/:id/toggle-flash_sale", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.toggleFlashSale);
router.patch("/toggle-multiple-flash_sale", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.toggleMultipleFlashSale);
// ------------------------ Variants routes --------------------------------
router.delete("/variants/:id", auth_middleware_1.verifyJWT, (0, role_middleware_1.checkPermission)("products:manage"), product_controller_1.deleteVariant);
exports.default = router;
