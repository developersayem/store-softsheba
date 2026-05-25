import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getStoreSettings,
  updateStoreSettings,
} from "../controllers/store_settings.controller";
import { uploadTo } from "../middlewares/upload.middleware";
const router = Router();

/* =====================================================
   Public Routes
===================================================== */

// Get store settings
router.get("/", getStoreSettings);

/* =====================================================
   Admin Routes (Protected)
===================================================== */

// Update store settings (partial update supported)
router.patch(
  "/update",
  verifyJWT,
  uploadTo("store-settings").fields([
    { name: "site_logo", maxCount: 1 },
    { name: "cart_logo", maxCount: 1 },
    { name: "footer_left_icon", maxCount: 1 },
    { name: "footer_right_icon", maxCount: 1 },
    { name: "flash_banner_image", maxCount: 1 },
    { name: "flash_countdown_image", maxCount: 1 },
    { name: "hero_images", maxCount: 10 },
    { name: "fav_icon", maxCount: 1 },
  ]),
  updateStoreSettings
);

export default router;
