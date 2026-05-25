import { AsyncLocalStorage } from "async_hooks";
import mongoose from "mongoose";

const storage = new AsyncLocalStorage<{ storeId: mongoose.Types.ObjectId }>();

/**
 * Global Store Context for single-vendor isolation
 */
export const StoreContext = {
  run(storeId: any, callback: () => void) {
    // No-op run
    return callback();
  },

  getStoreId(): any {
    return undefined;
  },

  getStoreData() {
    return undefined;
  }
};
