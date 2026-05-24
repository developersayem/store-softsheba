import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { orders, orderItems, refunds } from "../db/schema";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, paymentGateway, notes } = req.body;
    const userId = req.user?.userId || req.user?.id; // Depends on your JWT payload

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!items || !items.length) {
      throw new ApiError(400, "Order items are required");
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order transaction (assuming Drizzle transaction)
    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        userId,
        totalAmount,
        paymentGateway: paymentGateway || "manual",
        notes,
      }).returning();

      const orderItemsToInsert = items.map((item: any) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      }));

      await tx.insert(orderItems).values(orderItemsToInsert);

      return newOrder;
    });

    return next(new ApiResponse(201, result, "Order created successfully"));
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(500, "Failed to create order"));
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    return next(new ApiResponse(200, userOrders, "Orders fetched successfully"));
  } catch (error) {
    return next(new ApiError(500, "Failed to fetch orders"));
  }
};

export const initiateRefund = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      throw new ApiError(400, "Amount and reason are required for refund");
    }

    const orderId = parseInt(id as string, 10);
    if (isNaN(orderId)) {
       throw new ApiError(400, "Invalid order ID");
    }

    const [newRefund] = await db.insert(refunds).values({
      orderId,
      amount,
      reason,
      status: "requested",
    }).returning();

    return next(new ApiResponse(201, newRefund, "Refund requested successfully"));
  } catch (error) {
     if (error instanceof ApiError) return next(error);
    return next(new ApiError(500, "Failed to request refund"));
  }
};
