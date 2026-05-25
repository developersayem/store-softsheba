import { Types } from "mongoose";
import { Coupon, CouponUsage } from "../models/coupon.model";
import { ApiError } from "../utils/ApiError";
import fs from "fs";
import csv from "csv-parser";

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discount_type: "flat" | "percentage";
  discount: number | string;
  min_purchase?: number | string;
  start_date: string | Date;
  end_date: string | Date;
  products?: string[] | string;
  isActive?: boolean | string;
}

// -----------------------------
// HELPER: Normalize Payload
// -----------------------------
const normalizeCouponPayload = (payload: Partial<CreateCouponPayload>) => {
  // Parse numbers
  const discount = Number(payload.discount);
  const min_purchase = payload.min_purchase
    ? Number(payload.min_purchase)
    : undefined;

  // Parse boolean
  const isActive = payload.isActive === "true" || payload.isActive === true;

  // Parse products array
  let products: string[] = [];
  if (payload.products) {
    if (typeof payload.products === "string") {
      try {
        products = JSON.parse(payload.products);
      } catch {
        throw new ApiError(400, "Invalid products array");
      }
    } else if (Array.isArray(payload.products)) {
      products = payload.products;
    }
  }

  const productIds = products
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (!payload.start_date) throw new ApiError(400, "start_date is required");
  if (!payload.end_date) throw new ApiError(400, "end_date is required");

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
export const couponService = {
  // -----------------------------
  // CREATE
  // -----------------------------
  async createCoupon(payload: CreateCouponPayload) {
    if (!payload.code) throw new ApiError(400, "Coupon code is required");
    if (!payload.discount_type)
      throw new ApiError(400, "Discount type is required");
    if (payload.discount === undefined || payload.discount === null)
      throw new ApiError(400, "Discount value is required");

    const exists = await Coupon.findOne({ code: payload.code });
    if (exists) throw new ApiError(400, "Coupon code already exists");

    const normalized = normalizeCouponPayload(payload);
    return Coupon.create(normalized);
  },

  // -----------------------------
  // LIST
  // -----------------------------
  async listCoupons() {
    return Coupon.find().populate("products", "name thumbnail price").lean();
  },

  // -----------------------------
  // GET BY ID
  // -----------------------------
  async getCouponById(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid coupon id");
    const coupon = await Coupon.findById(id)
      .populate("products", "name thumbnail price")
      .lean();
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  },
  async getCouponByCode(code: string) {
    const coupon = await Coupon.findOne({code:code});
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  },

  // -----------------------------
  // UPDATE
  // -----------------------------
  async updateCoupon(id: string, payload: Partial<CreateCouponPayload>) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid coupon id");

    const coupon = await Coupon.findById(id);
    if (!coupon) throw new ApiError(404, "Coupon not found");

    const normalized = normalizeCouponPayload(payload);
    Object.assign(coupon, normalized);
    return coupon.save();
  },

  // -----------------------------
  // DELETE
  // -----------------------------
  async deleteCoupon(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid coupon id");
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Coupon not found");
    return deleted;
  },

  // -----------------------------
  // APPLY COUPON TO ORDER
  // -----------------------------
  async applyCouponToOrder(
    couponCode: string,
    orderId: string,
    productId?: string
  ) {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) throw new ApiError(404, "Coupon not found or inactive");

    if (!Types.ObjectId.isValid(orderId))
      throw new ApiError(400, "Invalid order id");

    const productObjId =
      productId && Types.ObjectId.isValid(productId)
        ? new Types.ObjectId(productId)
        : undefined;

    return CouponUsage.create({
      couponId: coupon._id,
      orderId: new Types.ObjectId(orderId),
      productId: productObjId,
      used_at: new Date(),
    });
  },

  // -----------------------------
  // BULK DELETE
  // -----------------------------
  async deleteMany(ids: string[]) {
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    return Coupon.deleteMany({ _id: { $in: objectIds } });
  },

  // -----------------------------
  // TOGGLE SINGLE ACTIVE STATUS
  // -----------------------------
  async toggleStatus(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError(400, "Invalid coupon id");

    const coupon = await Coupon.findById(id);
    if (!coupon) throw new ApiError(404, "Coupon not found");

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  },

  // -----------------------------
  // TOGGLE MULTIPLE ACTIVE STATUS
  // -----------------------------
  async toggleMultiple(ids: string[], action: "activate" | "deactivate") {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new ApiError(400, "IDs array required");

    const isActive = action === "activate";
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    await Coupon.updateMany(
      { _id: { $in: objectIds } },
      { $set: { isActive } }
    );

    return { updated: objectIds.length, isActive };
  },

  // -----------------------------
  // IMPORT JSON OR CSV
  // -----------------------------
  async importCoupons(filePath: string, ext: string) {
    const results: any[] = [];

    try {
      // ---------- JSON ----------
      if (ext === "json") {
        const raw = await fs.promises.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);

        const data = parsed.map((c: any) => normalizeCouponPayload(c));
        await Coupon.insertMany(data, { ordered: false });

        try {
          await fs.promises.unlink(filePath);
        } catch {}

        return data.length;
      }

      // ---------- CSV ----------
      if (ext === "csv") {
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row: any) => {
              results.push(
                normalizeCouponPayload({
                  code: row["Code"]?.replace(/"/g, ""),
                  description: row["Description"] || "",
                  discount_type:
                    row["Type"]?.toLowerCase() === "flat"
                      ? "flat"
                      : "percentage",
                  discount: row["Discount"],
                  min_purchase: row["Min Purchase"] || undefined,
                  start_date: row["Start Date"],
                  end_date: row["End Date"],
                  products: row["Products"] ? row["Products"].split(",") : [],
                  isActive: row["Active"],
                })
              );
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

        await Coupon.bulkWrite(bulkOps);

        try {
          await fs.promises.unlink(filePath);
        } catch {}

        return results.length;
      }

      throw new ApiError(400, "Unsupported file format");
    } catch (err) {
      console.error("Error importing coupons:", err);
      throw new ApiError(500, "Failed to import coupons");
    }
  },
};
