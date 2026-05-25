"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreContext = void 0;
const async_hooks_1 = require("async_hooks");
const storage = new async_hooks_1.AsyncLocalStorage();
/**
 * Global Store Context for single-vendor isolation
 */
exports.StoreContext = {
    run(storeId, callback) {
        // No-op run
        return callback();
    },
    getStoreId() {
        return undefined;
    },
    getStoreData() {
        return undefined;
    }
};
