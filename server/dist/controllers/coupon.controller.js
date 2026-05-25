"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCouponsFile = exports.toggleMultipleCoupons = exports.toggleCouponStatus = exports.deleteManyCoupons = exports.applyCoupon = exports.deleteCoupon = exports.updateCoupon = exports.getCouponByCode = exports.getCoupon = exports.listCoupons = exports.createCoupon = void 0;
const coupon_service_1 = require("../services/coupon.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
// CRUD
exports.createCoupon = (0, asyncHandler_1.default)(async (req, res) => {
    const coupon = await coupon_service_1.couponService.createCoupon(req.body);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, coupon, "Coupon created"));
});
exports.listCoupons = (0, asyncHandler_1.default)(async (_req, res) => {
    const coupons = await coupon_service_1.couponService.listCoupons();
    res.status(200).json(new ApiResponse_1.ApiResponse(200, coupons, "Coupons fetched"));
});
exports.getCoupon = (0, asyncHandler_1.default)(async (req, res) => {
    const coupon = await coupon_service_1.couponService.getCouponById(req.params.id);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, coupon, "Coupon fetched"));
});
exports.getCouponByCode = (0, asyncHandler_1.default)(async (req, res) => {
    const coupon = await coupon_service_1.couponService.getCouponByCode(req.params.code);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, coupon, "Coupon fetched"));
});
exports.updateCoupon = (0, asyncHandler_1.default)(async (req, res) => {
    const coupon = await coupon_service_1.couponService.updateCoupon(req.params.id, req.body);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, coupon, "Coupon updated"));
});
exports.deleteCoupon = (0, asyncHandler_1.default)(async (req, res) => {
    const deleted = await coupon_service_1.couponService.deleteCoupon(req.params.id);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, deleted, "Coupon deleted"));
});
exports.applyCoupon = (0, asyncHandler_1.default)(async (req, res) => {
    const { couponCode, orderId } = req.body;
    const usage = await coupon_service_1.couponService.applyCouponToOrder(couponCode, orderId);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, usage, "Coupon applied"));
});
// Bulk
exports.deleteManyCoupons = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids } = req.body;
    const result = await coupon_service_1.couponService.deleteMany(ids);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, result, "Coupons deleted"));
});
// Toggle single
exports.toggleCouponStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const coupon = await coupon_service_1.couponService.toggleStatus(req.params.id);
    const message = coupon.isActive ? "Coupon activated" : "Coupon deactivated";
    res.status(200).json(new ApiResponse_1.ApiResponse(200, coupon, message));
});
// Toggle multiple
exports.toggleMultipleCoupons = (0, asyncHandler_1.default)(async (req, res) => {
    const { ids, action } = req.body;
    const result = await coupon_service_1.couponService.toggleMultiple(ids, action);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, result, `Coupons ${action}d`));
});
// Import
exports.importCouponsFile = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file)
        throw new ApiError_1.ApiError(400, "No file uploaded");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    if (!ext)
        throw new ApiError_1.ApiError(400, "File extension missing");
    const count = await coupon_service_1.couponService.importCoupons(req.file.path, ext);
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { count }, `${count} coupons imported`));
});
