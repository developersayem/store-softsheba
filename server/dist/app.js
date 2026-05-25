"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const loggerMiddleware_1 = require("./middlewares/loggerMiddleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const license_guard_middleware_1 = require("./middlewares/license-guard.middleware");
const ratelimit_middleware_1 = require("./middlewares/ratelimit.middleware");
const store_middleware_1 = require("./middlewares/store.middleware");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const heartbeat_service_1 = require("./services/heartbeat.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// MOVE LOGGER TO VERY TOP TO CATCH EVERYTHING
app.use(loggerMiddleware_1.loggerMiddleware);
const config_1 = require("./config");
(0, heartbeat_service_1.initHeartbeat)();
// ============================
// CORS Setup
// ============================
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = config_1.config.cors.allowedOrigins;
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
        if (baseDomain &&
            (originDomain === baseDomain || originDomain.endsWith(`.${baseDomain}`))) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: config_1.config.cors.credentials,
}));
app.set("trust proxy", 1);
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
app.use((0, cookie_parser_1.default)());
app.use("/public", express_1.default.static(path_1.default.join(process.cwd(), "public")));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.get("/api/doc", (req, res) => {
    res.sendFile(path_1.default.resolve("public/index.html"));
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
app.use(store_middleware_1.storeMiddleware);
// Per-store rate limiting (applied after store is identified)
app.use("/api/", ratelimit_middleware_1.apiLimiter);
// ============================
// Data Routes
// ============================
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const attribute_routes_1 = __importDefault(require("./routes/attribute.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const collection_routes_1 = __importDefault(require("./routes/collection.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const purchase_routes_1 = __importDefault(require("./routes/purchase.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const shipping_rule_routes_1 = __importDefault(require("./routes/shipping_rule.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const store_settings_routes_1 = __importDefault(require("./routes/store_settings.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const courier_api_routes_1 = __importDefault(require("./routes/courier_api.routes"));
const marketing_routes_1 = __importDefault(require("./routes/marketing.routes"));
const support_routes_1 = __importDefault(require("./routes/support.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const license_routes_1 = __importDefault(require("./routes/license.routes"));
const staff_routes_1 = __importDefault(require("./routes/staff.routes"));
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/license", license_routes_1.default);
// Apply license check for all subsequent data routes
app.use(license_guard_middleware_1.licenseGuard);
app.use("/api/v1/dashboard", dashboard_routes_1.default);
app.use("/api/v1/products", product_routes_1.default);
app.use("/api/v1/attributes", attribute_routes_1.default);
app.use("/api/v1/categories", category_routes_1.default);
app.use("/api/v1/collections", collection_routes_1.default);
app.use("/api/v1/brands", brand_routes_1.default);
app.use("/api/v1/suppliers", supplier_routes_1.default);
app.use("/api/v1/purchases", purchase_routes_1.default);
app.use("/api/v1/inventory", inventory_routes_1.default);
app.use("/api/v1/orders", order_routes_1.default);
app.use("/api/v1/customers", customer_routes_1.default);
app.use("/api/v1/shipping-rules", shipping_rule_routes_1.default);
app.use("/api/v1/coupons", coupon_routes_1.default);
app.use("/api/v1/analytics", analytics_routes_1.default);
app.use("/api/v1/notifications", notification_routes_1.default);
app.use("/api/v1/store-settings", store_settings_routes_1.default);
app.use("/api/v1/reviews", review_routes_1.default);
app.use("/api/v1/courier-api", courier_api_routes_1.default);
app.use("/api/v1/marketing", marketing_routes_1.default);
app.use("/api/v1/support", support_routes_1.default);
app.use("/api/v1/stores", store_routes_1.default);
app.use("/api/v1/staff", staff_routes_1.default);
app.use(error_middleware_1.errorHandler);
