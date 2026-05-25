import { CookieOptions } from "express";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction, // secure only in production
  sameSite: isProduction ? "none" : "lax", // lax in local, none in prod
  domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // no domain for localhost
  path: "/",
};
