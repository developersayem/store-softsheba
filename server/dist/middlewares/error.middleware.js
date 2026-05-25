"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError_1.ApiError)) {
        const isMongooseError = error instanceof mongoose_1.default.Error;
        const isMongoError = error.code === 11000;
        let statusCode = error.statusCode || (isMongooseError || isMongoError ? 400 : 500);
        let message = error.message || "Something went wrong";
        // Handle MongoDB Duplicate Key Error (E11000)
        if (isMongoError) {
            const keyPattern = error.keyPattern || {};
            const fields = Object.keys(keyPattern).filter(k => k !== "storeId");
            const fieldName = fields[0] || "record";
            message = `A ${fieldName} with this value already exists.`;
            // Specific user-friendly mapping
            if (fieldName === "phone")
                message = "A customer with this phone number already exists.";
            if (fieldName === "email")
                message = "A customer with this email address already exists.";
        }
        error = new ApiError_1.ApiError(statusCode, message, error.error || [], error.stack || "");
    }
    if (process.env.NODE_ENV === "development") {
        console.error("DEBUG ERROR:", error);
    }
    const response = {
        statusCode: error.statusCode,
        message: error.message,
        error: error.error || [],
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };
    // Just send the response; don't return anything
    res.status(error.statusCode).json(response);
};
exports.errorHandler = errorHandler;
