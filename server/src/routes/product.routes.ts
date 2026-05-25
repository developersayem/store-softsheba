// routes/product.routes.ts
import { Router } from "express";
import {
  createProduct,
  deleteMultiple,
  deleteProduct,
  getProductById,
  getProductBySlug,
  listAllProducts,
  updateProduct,
  togglePublished,
  listActiveProducts,
  toggleFlashSale,
  toggleMultiplePublished,
  toggleMultipleFlashSale,
  deleteVariant,
  listAllActiveFlashSaleProducts,
  getProductByIdWithAllVariants,
  getProductSearchController,
  listAllProductsWithOffers,
} from "../controllers/product.controller";

import { uploadTo } from "../middlewares/upload.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.get("/", listActiveProducts);
router.get("/all", listAllProducts);
router.get("/flash-sale", listAllActiveFlashSaleProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.get("/:id/with-all-variants", getProductByIdWithAllVariants);
router.get("/search-products/suggestions", getProductSearchController);

// Protected admin routes
router.post(
  "/",
  verifyJWT,
  checkPermission("products:manage"),
  uploadTo("products").any(),
  createProduct
);

router.put(
  "/:id",
  verifyJWT,
  checkPermission("products:manage"),
  uploadTo("products").any(),
  updateProduct
);

router.get("/offers/products", verifyJWT, checkPermission("products:view"), listAllProductsWithOffers)

router.delete("/:id", verifyJWT, checkPermission("products:manage"), deleteProduct);
router.post("/delete-many", verifyJWT, checkPermission("products:manage"), deleteMultiple);
router.patch("/:id/toggle-publish", verifyJWT, checkPermission("products:manage"), togglePublished);
router.patch("/toggle-multiple-publish", verifyJWT, checkPermission("products:manage"), toggleMultiplePublished);
router.patch("/:id/toggle-flash_sale", verifyJWT, checkPermission("products:manage"), toggleFlashSale);
router.patch("/toggle-multiple-flash_sale", verifyJWT, checkPermission("products:manage"), toggleMultipleFlashSale);

// ------------------------ Variants routes --------------------------------
router.delete("/variants/:id", verifyJWT, checkPermission("products:manage"), deleteVariant);

export default router;
