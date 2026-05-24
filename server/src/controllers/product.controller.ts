import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { products } from "../db/schema";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { eq } from "drizzle-orm";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allProducts = await db.select().from(products);
    return next(new ApiResponse(200, allProducts, "Products fetched successfully"));
  } catch (error) {
    return next(new ApiError(500, "Failed to fetch products"));
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, salePrice, currency, image, type, billingCycle } = req.body;

    if (!name || !price) {
      throw new ApiError(400, "Name and price are required");
    }

    if (type === "subscription" && !billingCycle) {
      throw new ApiError(400, "Billing cycle is required for subscription products");
    }

    const [newProduct] = await db.insert(products).values({
      name,
      description,
      price,
      salePrice,
      currency,
      image,
      type: type || "standard",
      billingCycle: type === "subscription" ? billingCycle : null,
    }).returning();

    return next(new ApiResponse(201, newProduct, "Product created successfully"));
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(500, "Failed to create product"));
  }
};
