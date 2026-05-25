"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeIsolationPlugin = void 0;
/**
 * Mongoose plugin to enforce store isolation.
 * Automatically adds { storeId: currentStoreId } to queries using StoreContext.
 */
const storeIsolationPlugin = (schema) => {
    // NO-OP: Multi-tenancy disabled as per user request for single-store application.
    // This avoids breaking existing model definitions while stopping all filtering.
};
exports.storeIsolationPlugin = storeIsolationPlugin;
