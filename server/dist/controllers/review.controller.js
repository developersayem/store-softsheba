"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultiple = exports.deleteReview = exports.rejectReview = exports.approveReview = exports.getAllReviews = exports.getProductReviews = exports.createReview = void 0;
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const review_service_1 = require("../services/review.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
// ==========================
// CREATE REVIEW (PUBLIC)
// ==========================
exports.createReview = (0, asyncHandler_1.default)(async (req, res) => {
    await review_service_1.reviewService.create(req.body);
    res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, null, "Review submitted. Waiting for admin approval."));
});
// ==========================
// GET APPROVED REVIEWS
// ==========================
exports.getProductReviews = (0, asyncHandler_1.default)(async (req, res) => {
    const reviews = await review_service_1.reviewService.getApprovedByProduct(req.params.slug);
    res.json(new ApiResponse_1.ApiResponse(200, reviews));
});
// ==========================
// ADMIN: GET ALL REVIEWS
// ==========================
exports.getAllReviews = (0, asyncHandler_1.default)(async (_req, res) => {
    const reviews = await review_service_1.reviewService.getAll();
    res.json(new ApiResponse_1.ApiResponse(200, reviews));
});
// ==========================
// ADMIN: APPROVE REVIEW
// ==========================
exports.approveReview = (0, asyncHandler_1.default)(async (req, res) => {
    await review_service_1.reviewService.approve(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, "Review approved"));
});
// ==========================
// ADMIN: REJECT REVIEW
// ==========================
exports.rejectReview = (0, asyncHandler_1.default)(async (req, res) => {
    await review_service_1.reviewService.reject(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, "Review approved"));
});
// ==========================
// ADMIN: DELETE REVIEW
// ==========================
exports.deleteReview = (0, asyncHandler_1.default)(async (req, res) => {
    await review_service_1.reviewService.delete(req.params.id);
    res.json(new ApiResponse_1.ApiResponse(200, null, "Review deleted"));
});
// delete many
exports.deleteMultiple = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids))
        throw new ApiError_1.ApiError(400, "ids array required");
    const result = await review_service_1.reviewService.deleteReviewsMany(ids);
    res.json(new ApiResponse_1.ApiResponse(200, result, `${result.deletedCount} Review(s) deleted`));
});
