"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const coupon_controller_1 = require("../controllers/coupon.controller");
const router = (0, express_1.Router)();
// CRUD
router.post("/", auth_middleware_1.verifyJWT, coupon_controller_1.createCoupon);
router.get("/", auth_middleware_1.verifyJWT, coupon_controller_1.listCoupons);
router.post("/apply", coupon_controller_1.applyCoupon);
router.get("/:code", coupon_controller_1.getCouponByCode);
// Bulk / toggle
router.post("/delete-many", auth_middleware_1.verifyJWT, coupon_controller_1.deleteManyCoupons);
// Import
router.post("/import", auth_middleware_1.verifyJWT, (0, upload_middleware_1.uploadTo)("temp").single("file"), coupon_controller_1.importCouponsFile);
router.patch("/toggle-multiple", auth_middleware_1.verifyJWT, coupon_controller_1.toggleMultipleCoupons);
// dynamic routes
router.get("/:id", auth_middleware_1.verifyJWT, coupon_controller_1.getCoupon);
router.patch("/:id", auth_middleware_1.verifyJWT, coupon_controller_1.updateCoupon);
router.delete("/:id", auth_middleware_1.verifyJWT, coupon_controller_1.deleteCoupon);
router.patch("/:id/toggle-status", auth_middleware_1.verifyJWT, coupon_controller_1.toggleCouponStatus);
exports.default = router;
