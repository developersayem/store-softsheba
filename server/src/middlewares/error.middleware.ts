import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let error = err as
    | ApiError
    | (Error & { statusCode?: number; error?: unknown[]; stack?: string });

  if (!(error instanceof ApiError)) {
    const isMongooseError = error instanceof mongoose.Error;
    const isMongoError = (error as any).code === 11000;
    
    let statusCode = error.statusCode || (isMongooseError || isMongoError ? 400 : 500);
    let message = error.message || "Something went wrong";

    // Handle MongoDB Duplicate Key Error (E11000)
    if (isMongoError) {
      const keyPattern = (error as any).keyPattern || {};
      const fields = Object.keys(keyPattern).filter(k => k !== "storeId");
      const fieldName = fields[0] || "record";
      message = `A ${fieldName} with this value already exists.`;
      
      // Specific user-friendly mapping
      if (fieldName === "phone") message = "A customer with this phone number already exists.";
      if (fieldName === "email") message = "A customer with this email address already exists.";
    }

    error = new ApiError(
      statusCode,
      message,
      error.error || [],
      error.stack || "",
    );
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
  res.status(error.statusCode!).json(response);
};

export { errorHandler };
