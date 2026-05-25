"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
exports.cookieOptions = {
    httpOnly: true,
    secure: isProduction, // secure only in production
    sameSite: isProduction ? "none" : "lax", // lax in local, none in prod
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // no domain for localhost
    path: "/",
};
