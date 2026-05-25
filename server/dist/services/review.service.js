"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
// services/review.service.ts
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const review_model_1 = require("../models/review.model");
const ApiError_1 = require("../utils/ApiError");
const product_service_1 = require("./product.service");
exports.reviewService = {
    async create(payload) {
        const { slug, name, email, rating, review } = payload;
        if (!slug || !name || !email || !rating || !review) {
            throw new ApiError_1.ApiError(400, "All fields are required");
        }
        // find product id by slug
        const product = await product_service_1.productService.getBySlug(slug);
        if (!product) {
            throw new ApiError_1.ApiError(404, "Product not found");
        }
        return review_model_1.Review.create({
            product,
            name,
            email,
            rating,
            review,
        });
    },
    async getApprovedByProduct(slug) {
        const product = await product_service_1.productService.getBySlug(slug);
        if (!product) {
            throw new ApiError_1.ApiError(404, "Product not found");
        }
        return review_model_1.Review.find({
            product: product._id,
            isApproved: true,
        }).sort({ createdAt: -1 });
    },
    async getAll() {
        return review_model_1.Review.find()
            .populate("product", "name slug thumbnail")
            .sort({ createdAt: -1 });
    },
    async approve(id) {
        const review = await review_model_1.Review.findById(id);
        if (!review)
            throw new ApiError_1.ApiError(404, "Review not found");
        review.isApproved = true;
        await review.save();
        return review;
    },
    async reject(id) {
        const review = await review_model_1.Review.findById(id);
        if (!review)
            throw new ApiError_1.ApiError(404, "Review not found");
        review.isApproved = false;
        await review.save();
        return review;
    },
    async delete(id) {
        if (!mongoose_2.default.isValidObjectId(id)) {
            throw new ApiError_1.ApiError(400, "Invalid review ID");
        }
        const review = await review_model_1.Review.findByIdAndDelete(id);
        if (!review)
            throw new ApiError_1.ApiError(404, "Review not found");
        return true;
    },
    async deleteReviewsMany(ids) {
        const invalidIds = ids.filter((id) => !mongoose_1.Types.ObjectId.isValid(id));
        if (invalidIds.length)
            throw new ApiError_1.ApiError(400, `Invalid review ids: ${invalidIds.join(", ")}`);
        const reviews = await review_model_1.Review.find({ _id: { $in: ids } });
        if (!reviews.length)
            throw new ApiError_1.ApiError(404, "No products found for the given IDs");
        const reviewsIds = reviews.map((o) => o._id);
        // Delete reviews
        const result = await review_model_1.Review.deleteMany({ _id: { $in: reviewsIds } });
        return result;
    },
};
