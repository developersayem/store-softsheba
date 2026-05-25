// services/review.service.ts
import { Types } from "mongoose";
import mongoose from "mongoose";
import { Review } from "../models/review.model";
import { ApiError } from "../utils/ApiError";
import { productService } from "./product.service";

export const reviewService = {
  async create(payload: any) {
    const { slug, name, email, rating, review, location } = payload;

    if (!slug || !name || !email || !rating || !review) {
      throw new ApiError(400, "All fields are required");
    }

    // find product id by slug
    const product = await productService.getBySlug(slug);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return Review.create({
      product,
      name,
      location,
      email,
      rating,
      review,
    });
  },

  async getApprovedByProduct(slug: string) {
    const product = await productService.getBySlug(slug);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return Review.find({
      product: product._id,
      isApproved: true,
    }).sort({ createdAt: -1 });
  },

  async getAll() {
    return Review.find()
      .populate("product", "name slug thumbnail")
      .sort({ createdAt: -1 });
  },

  async approve(id: string) {
    const review = await Review.findById(id);
    if (!review) throw new ApiError(404, "Review not found");

    review.isApproved = true;
    await review.save();

    return review;
  },
  async reject(id: string) {
    const review = await Review.findById(id);
    if (!review) throw new ApiError(404, "Review not found");

    review.isApproved = false;
    await review.save();

    return review;
  },

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid review ID");
    }

    const review = await Review.findByIdAndDelete(id);
    if (!review) throw new ApiError(404, "Review not found");

    return true;
  },
  async deleteReviewsMany(ids: string[]) {
    const invalidIds = ids.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length)
      throw new ApiError(400, `Invalid review ids: ${invalidIds.join(", ")}`);
    const reviews = await Review.find({ _id: { $in: ids } });
    if (!reviews.length)
      throw new ApiError(404, "No products found for the given IDs");
    const reviewsIds = reviews.map((o) => o._id);
    // Delete reviews
    const result = await Review.deleteMany({ _id: { $in: reviewsIds } });
    return result;
  },
};
