"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponService = void 0;
const mongoose_1 = require("mongoose");
const coupon_model_1 = require("../models/coupon.model");
const ApiError_1 = require("../utils/ApiError");
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
// -----------------------------
// HELPER: Normalize Payload
// -----------------------------
const normalizeCouponPayload = (payload) => {
    // Parse numbers
    const discount = Number(payload.discount);
    const min_purchase = payload.min_purchase
        ? Number(payload.min_purchase)
        : undefined;
    // Parse boolean
    const isActive = payload.isActive === "true" || payload.isActive === true;
    // Parse products array
    let products = [];
    if (payload.products) {
        if (typeof payload.products === "string") {
            try {
                products = JSON.parse(payload.products);
            }
            catch {
                throw new ApiError_1.ApiError(400, "Invalid products array");
            }
        }
        else if (Array.isArray(payload.products)) {
            products = payload.products;
        }
    }
    const productIds = products
        .filter((id) => mongoose_1.Types.ObjectId.isValid(id))
        .map((id) => new mongoose_1.Types.ObjectId(id));
    if (!payload.start_date)
        throw new ApiError_1.ApiError(400, "start_date is required");
    if (!payload.end_date)
        throw new ApiError_1.ApiError(400, "end_date is required");
    const start_date = new Date(payload.start_date);
    const end_date = new Date(payload.end_date);
    return {
        ...payload,
        discount,
        min_purchase,
        isActive,
        products: productIds,
        start_date,
        end_date,
    };
};
// -----------------------------
// SERVICE
// -----------------------------
exports.couponService = {
    // -----------------------------
    // CREATE
    // -----------------------------
    async createCoupon(payload) {
        if (!payload.code)
            throw new ApiError_1.ApiError(400, "Coupon code is required");
        if (!payload.discount_type)
            throw new ApiError_1.ApiError(400, "Discount type is required");
        if (payload.discount === undefined || payload.discount === null)
            throw new ApiError_1.ApiError(400, "Discount value is required");
        const exists = await coupon_model_1.Coupon.findOne({ code: payload.code });
        if (exists)
            throw new ApiError_1.ApiError(400, "Coupon code already exists");
        const normalized = normalizeCouponPayload(payload);
        return coupon_model_1.Coupon.create(normalized);
    },
    // -----------------------------
    // LIST
    // -----------------------------
    async listCoupons() {
        return coupon_model_1.Coupon.find().populate("products", "name thumbnail price").lean();
    },
    // -----------------------------
    // GET BY ID
    // -----------------------------
    async getCouponById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid coupon id");
        const coupon = await coupon_model_1.Coupon.findById(id)
            .populate("products", "name thumbnail price")
            .lean();
        if (!coupon)
            throw new ApiError_1.ApiError(404, "Coupon not found");
        return coupon;
    },
    async getCouponByCode(code) {
        const coupon = await coupon_model_1.Coupon.findOne({ code: code });
        if (!coupon)
            throw new ApiError_1.ApiError(404, "Coupon not found");
        return coupon;
    },
    // -----------------------------
    // UPDATE
    // -----------------------------
    async updateCoupon(id, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid coupon id");
        const coupon = await coupon_model_1.Coupon.findById(id);
        if (!coupon)
            throw new ApiError_1.ApiError(404, "Coupon not found");
        const normalized = normalizeCouponPayload(payload);
        Object.assign(coupon, normalized);
        return coupon.save();
    },
    // -----------------------------
    // DELETE
    // -----------------------------
    async deleteCoupon(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid coupon id");
        const deleted = await coupon_model_1.Coupon.findByIdAndDelete(id);
        if (!deleted)
            throw new ApiError_1.ApiError(404, "Coupon not found");
        return deleted;
    },
    // -----------------------------
    // APPLY COUPON TO ORDER
    // -----------------------------
    async applyCouponToOrder(couponCode, orderId, productId) {
        const coupon = await coupon_model_1.Coupon.findOne({ code: couponCode, isActive: true });
        if (!coupon)
            throw new ApiError_1.ApiError(404, "Coupon not found or inactive");
        if (!mongoose_1.Types.ObjectId.isValid(orderId))
            throw new ApiError_1.ApiError(400, "Invalid order id");
        const productObjId = productId && mongoose_1.Types.ObjectId.isValid(productId)
            ? new mongoose_1.Types.ObjectId(productId)
            : undefined;
        return coupon_model_1.CouponUsage.create({
            couponId: coupon._id,
            orderId: new mongoose_1.Types.ObjectId(orderId),
            productId: productObjId,
            used_at: new Date(),
        });
    },
    // -----------------------------
    // BULK DELETE
    // -----------------------------
    async deleteMany(ids) {
        const objectIds = ids
            .filter((id) => mongoose_1.Types.ObjectId.isValid(id))
            .map((id) => new mongoose_1.Types.ObjectId(id));
        return coupon_model_1.Coupon.deleteMany({ _id: { $in: objectIds } });
    },
    // -----------------------------
    // TOGGLE SINGLE ACTIVE STATUS
    // -----------------------------
    async toggleStatus(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new ApiError_1.ApiError(400, "Invalid coupon id");
        const coupon = await coupon_model_1.Coupon.findById(id);
        if (!coupon)
            throw new ApiError_1.ApiError(404, "Coupon not found");
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        return coupon;
    },
    // -----------------------------
    // TOGGLE MULTIPLE ACTIVE STATUS
    // -----------------------------
    async toggleMultiple(ids, action) {
        if (!Array.isArray(ids) || ids.length === 0)
            throw new ApiError_1.ApiError(400, "IDs array required");
        const isActive = action === "activate";
        const objectIds = ids
            .filter((id) => mongoose_1.Types.ObjectId.isValid(id))
            .map((id) => new mongoose_1.Types.ObjectId(id));
        await coupon_model_1.Coupon.updateMany({ _id: { $in: objectIds } }, { $set: { isActive } });
        return { updated: objectIds.length, isActive };
    },
    // -----------------------------
    // IMPORT JSON OR CSV
    // -----------------------------
    async importCoupons(filePath, ext) {
        const results = [];
        try {
            // ---------- JSON ----------
            if (ext === "json") {
                const raw = await fs_1.default.promises.readFile(filePath, "utf-8");
                const parsed = JSON.parse(raw);
                const data = parsed.map((c) => normalizeCouponPayload(c));
                await coupon_model_1.Coupon.insertMany(data, { ordered: false });
                try {
                    await fs_1.default.promises.unlink(filePath);
                }
                catch { }
                return data.length;
            }
            // ---------- CSV ----------
            if (ext === "csv") {
                await new Promise((resolve, reject) => {
                    fs_1.default.createReadStream(filePath)
                        .pipe((0, csv_parser_1.default)())
                        .on("data", (row) => {
                        results.push(normalizeCouponPayload({
                            code: row["Code"]?.replace(/"/g, ""),
                            description: row["Description"] || "",
                            discount_type: row["Type"]?.toLowerCase() === "flat"
                                ? "flat"
                                : "percentage",
                            discount: row["Discount"],
                            min_purchase: row["Min Purchase"] || undefined,
                            start_date: row["Start Date"],
                            end_date: row["End Date"],
                            products: row["Products"] ? row["Products"].split(",") : [],
                            isActive: row["Active"],
                        }));
                    })
                        .on("end", resolve)
                        .on("error", reject);
                });
                const bulkOps = results.map((c) => ({
                    updateOne: {
                        filter: { code: c.code },
                        update: { $set: c },
                        upsert: true,
                    },
                }));
                await coupon_model_1.Coupon.bulkWrite(bulkOps);
                try {
                    await fs_1.default.promises.unlink(filePath);
                }
                catch { }
                return results.length;
            }
            throw new ApiError_1.ApiError(400, "Unsupported file format");
        }
        catch (err) {
            console.error("Error importing coupons:", err);
            throw new ApiError_1.ApiError(500, "Failed to import coupons");
        }
    },
};
