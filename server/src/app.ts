import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loggerMiddleware } from "./middlewares/loggerMiddleware";
import { errorHandler } from "./middlewares/error.middleware";
import { licenseGuard } from "./middlewares/license-guard.middleware";
import { apiLimiter } from "./middlewares/ratelimit.middleware";
import { storeMiddleware } from "./middlewares/store.middleware";
import path from "path";
import dotenv from "dotenv";
import { initHeartbeat } from "./services/heartbeat.service";

dotenv.config();

const app = express();

// MOVE LOGGER TO VERY TOP TO CATCH EVERYTHING
app.use(loggerMiddleware);

import { config } from "./config";
initHeartbeat();

// ============================
// CORS Setup
// ============================
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = config.cors.allowedOrigins;

      if (allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Automatically allow subdomains and root domain for specific domains if needed
      // but for a dedicated license project, we stick to allowed origins or configured domain
      const originDomain = origin.replace(/^https?:\/\//, "");
      const baseDomain = process.env.DOMAIN;

      if (
        baseDomain &&
        (originDomain === baseDomain || originDomain.endsWith(`.${baseDomain}`))
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: config.cors.credentials,
  }),
);

app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/demo", express.static(path.join(process.cwd(), "public", "demo")));

app.get("/api/doc", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// ============================
// Routes (Public/System)
// ============================

// ============================
// Middlewares
// ============================
// Logger moved to top

// ============================
// Store Identification
// ============================
app.use(storeMiddleware);

// Per-store rate limiting (applied after store is identified)
app.use("/api/", apiLimiter);

// ============================
// Data Routes
// ============================

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import attributeRoutes from "./routes/attribute.routes";
import categoryRoutes from "./routes/category.routes";
import collectionRoutes from "./routes/collection.routes";
import brandRoutes from "./routes/brand.routes";
import supplierRoutes from "./routes/supplier.routes";
import purchaseRoutes from "./routes/purchase.routes";
import inventoryRoutes from "./routes/inventory.routes";
import orderRoutes from "./routes/order.routes";
import customerRoutes from "./routes/customer.routes";
import ShippingRuleRoutes from "./routes/shipping_rule.routes";
import couponRoutes from "./routes/coupon.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationRoutes from "./routes/notification.routes";
import storeSettingsRoutes from "./routes/store_settings.routes";
import reviewRoutes from "./routes/review.routes";
import courierApiRoutes from "./routes/courier_api.routes";
import marketingRoutes from "./routes/marketing.routes";
import supportRoutes from "./routes/support.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import storeRoutes from "./routes/store.routes";
import licenseRoutes from "./routes/license.routes";
import staffRoutes from "./routes/staff.routes";
import landingPageRoutes from "./routes/landing-page.routes";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/license", licenseRoutes);

// Apply license check for all subsequent data routes
app.use(licenseGuard);

app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/attributes", attributeRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/shipping-rules", ShippingRuleRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/store-settings", storeSettingsRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/courier-api", courierApiRoutes);
app.use("/api/v1/marketing", marketingRoutes);
app.use("/api/v1/support", supportRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/landing-pages", landingPageRoutes);

app.use(errorHandler);

export { app };
