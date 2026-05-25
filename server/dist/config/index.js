"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || "5001", 10),
    mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/shopxet",
    // JWT Configuration
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || "access_secret",
        accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || "1d",
        refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || "refresh_secret",
        refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || "10d",
    },
    // CORS & Cookies
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
            : ["*"], // Allow anything by default if not specified
        credentials: true,
    },
    cookie: {
        domain: process.env.COOKIE_DOMAIN || undefined,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    },
    // Mail Configuration
    mail: {
        host: process.env.GMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.GMAIL_PORT || "465", 10),
        user: process.env.GMAIL_USER || "",
        pass: process.env.GMAIL_APP_PASSWORD || "",
    },
    // License Branding/Misc
    platform: {
        name: process.env.PLATFORM_NAME || "ShopXet",
        baseUrl: process.env.BASE_URL || "http://localhost:3000",
        lmsUrl: process.env.LMS_URL || "https://api-lms.shopxet.com",
        licenseKey: process.env.LICENSE_KEY || "",
    }
};
