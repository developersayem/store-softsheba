"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const store_settings_controller_1 = require("../controllers/store_settings.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
/* =====================================================
   Public Routes
===================================================== */
// Get store settings
router.get("/", store_settings_controller_1.getStoreSettings);
/* =====================================================
   Admin Routes (Protected)
===================================================== */
// Update store settings (partial update supported)
router.patch("/update", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("store-settings").fields([
    { name: "site_logo", maxCount: 1 },
    { name: "cart_logo", maxCount: 1 },
    { name: "footer_left_icon", maxCount: 1 },
    { name: "footer_right_icon", maxCount: 1 },
    { name: "flash_banner_image", maxCount: 1 },
    { name: "flash_countdown_image", maxCount: 1 },
    { name: "hero_images", maxCount: 10 },
    { name: "fav_icon", maxCount: 1 },
]), store_settings_controller_1.updateStoreSettings);
exports.default = router;
