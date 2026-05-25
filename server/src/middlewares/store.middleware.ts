import { Request, Response, NextFunction } from "express";
import { Store } from "../models/store.model";
import { StoreContext } from "../utils/store-context";

/**
 * Global Store Middleware for License mode.
 * Automatically identifies the primary store and establishes global context.
 */
export const storeMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = await Store.findOne().lean();
    if (store) {
      (req as any).storeId = store._id;
      (req as any).store = store;
    }
    next();
  } catch (error) {
    console.error("Store middleware error:", error);
    next();
  }
};
