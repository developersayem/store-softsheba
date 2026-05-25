// controllers/review.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { reviewService } from "../services/review.service";
import { ApiResponse } from "../utils/ApiResponse";
import { productService } from "../services/product.service";
import { ApiError } from "../utils/ApiError";

// ==========================
// CREATE REVIEW (PUBLIC)
// ==========================
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    await reviewService.create(req.body);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          null,
          "Review submitted. Waiting for admin approval."
        )
      );
  }
);

// ==========================
// GET APPROVED REVIEWS
// ==========================
export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await reviewService.getApprovedByProduct(
      req.params.slug as string
    );

    res.json(new ApiResponse(200, reviews));
  }
);

// ==========================
// ADMIN: GET ALL REVIEWS
// ==========================
export const getAllReviews = asyncHandler(
  async (_req: Request, res: Response) => {
    const reviews = await reviewService.getAll();
    res.json(new ApiResponse(200, reviews));
  }
);

// ==========================
// ADMIN: APPROVE REVIEW
// ==========================
export const approveReview = asyncHandler(
  async (req: Request, res: Response) => {
    await reviewService.approve(req.params.id as string);
    res.json(new ApiResponse(200, null, "Review approved"));
  }
);
// ==========================
// ADMIN: REJECT REVIEW
// ==========================
export const rejectReview = asyncHandler(
  async (req: Request, res: Response) => {
    await reviewService.reject(req.params.id as string);
    res.json(new ApiResponse(200, null, "Review approved"));
  }
);

// ==========================
// ADMIN: DELETE REVIEW
// ==========================
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    await reviewService.delete(req.params.id as string);
    res.json(new ApiResponse(200, null, "Review deleted"));
  }
);

// delete many
export const deleteMultiple = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) throw new ApiError(400, "ids array required");
    const result = await reviewService.deleteReviewsMany(ids);
    res.json(
      new ApiResponse(200, result, `${result.deletedCount} Review(s) deleted`)
    );
  }
);
