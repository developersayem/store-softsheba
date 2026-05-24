import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://root:password@localhost:5432/softsheba",
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_jwt_key_please_change_in_production",
};
