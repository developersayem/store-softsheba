import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export const generateToken = (payload: object, expiresIn: string | number = "1d") => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};
