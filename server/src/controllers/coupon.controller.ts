import { Request, Response } from "express";
import { couponService } from "../services/coupon.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

// CRUD
export const createCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json(new ApiResponse(201, coupon, "Coupon created"));
  }
);

export const listCoupons = asyncHandler(
  async (_req: Request, res: Response) => {
    const coupons = await couponService.listCoupons();
    res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched"));
  }
);

export const getCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id as string);
  res.status(200).json(new ApiResponse(200, coupon, "Coupon fetched"));
});

export const getCouponByCode = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.getCouponByCode(
      req.params.code as string
    );
    res.status(200).json(new ApiResponse(200, coupon, "Coupon fetched"));
  }
);

export const updateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.updateCoupon(
      req.params.id as string,
      req.body
    );
    res.status(200).json(new ApiResponse(200, coupon, "Coupon updated"));
  }
);

export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const deleted = await couponService.deleteCoupon(req.params.id as string);
    res.status(200).json(new ApiResponse(200, deleted, "Coupon deleted"));
  }
);

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponCode, orderId } = req.body;
  const usage = await couponService.applyCouponToOrder(couponCode, orderId);
  res.status(200).json(new ApiResponse(200, usage, "Coupon applied"));
});

// Bulk
export const deleteManyCoupons = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const result = await couponService.deleteMany(ids);
    res.status(200).json(new ApiResponse(200, result, "Coupons deleted"));
  }
);

// Toggle single
export const toggleCouponStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.toggleStatus(req.params.id as string);
    const message = coupon.isActive ? "Coupon activated" : "Coupon deactivated";
    res.status(200).json(new ApiResponse(200, coupon, message));
  }
);

// Toggle multiple
export const toggleMultipleCoupons = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, action } = req.body;
    const result = await couponService.toggleMultiple(ids, action);
    res.status(200).json(new ApiResponse(200, result, `Coupons ${action}d`));
  }
);

// Import
export const importCouponsFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    if (!ext) throw new ApiError(400, "File extension missing");

    const count = await couponService.importCoupons(req.file.path, ext);
    res
      .status(200)
      .json(new ApiResponse(200, { count }, `${count} coupons imported`));
  }
);
