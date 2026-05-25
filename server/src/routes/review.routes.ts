// routes/review.routes.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  approveReview,
  deleteReview,
  rejectReview,
  deleteMultiple,
} from "../controllers/review.controller";

const router = Router();

/**
 * PUBLIC
 */
router.post("/", createReview);
router.get("/product/:slug", getProductReviews);

/**
 * ADMIN
 */
router.get("/", getAllReviews);
router.patch("/:id/approve", verifyJWT, approveReview);
router.patch("/:id/reject", verifyJWT, rejectReview);
router.delete("/:id", verifyJWT, deleteReview);
router.post("/delete-many",verifyJWT,deleteMultiple)

export default router;
