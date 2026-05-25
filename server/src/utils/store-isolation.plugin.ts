import { Schema, Query } from "mongoose";
import { StoreContext } from "./store-context";

/**
 * Mongoose plugin to enforce store isolation.
 * Automatically adds { storeId: currentStoreId } to queries using StoreContext.
 */
export const storeIsolationPlugin = (schema: Schema) => {
  // NO-OP: Multi-tenancy disabled as per user request for single-store application.
  // This avoids breaking existing model definitions while stopping all filtering.
};
