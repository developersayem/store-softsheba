import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { uploadTo } from "../middlewares/upload.middleware";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  deleteManyCoupons,
  getCoupon,
  getCouponByCode,
  importCouponsFile,
  listCoupons,
  toggleCouponStatus,
  toggleMultipleCoupons,
  updateCoupon
} from "../controllers/coupon.controller";

const router = Router();

// CRUD
router.post("/", verifyJWT, createCoupon);
router.get("/", verifyJWT, listCoupons);
router.post("/apply", applyCoupon);

router.get("/:code",getCouponByCode);

// Bulk / toggle
router.post("/delete-many", verifyJWT, deleteManyCoupons);

// Import
router.post("/import", verifyJWT, uploadTo("temp").single("file"), importCouponsFile);

router.patch("/toggle-multiple", verifyJWT, toggleMultipleCoupons);

// dynamic routes
router.get("/:id", verifyJWT, getCoupon);
router.patch("/:id", verifyJWT, updateCoupon);
router.delete("/:id", verifyJWT, deleteCoupon);
router.patch("/:id/toggle-status", verifyJWT, toggleCouponStatus);


export default router;
