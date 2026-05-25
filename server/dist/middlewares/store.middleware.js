"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeMiddleware = void 0;
/**
 * Global Store Middleware for License mode.
 * Automatically identifies the primary store and establishes global context.
 */
const storeMiddleware = async (req, res, next) => {
    // Multi-tenancy disabled. Single-store architecture enforced.
    next();
};
exports.storeMiddleware = storeMiddleware;
