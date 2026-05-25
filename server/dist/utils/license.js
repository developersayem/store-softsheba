"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLicenseValid = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Check if license key is valid & not expired
 */
const isLicenseValid = () => {
    try {
        const licenseKey = process.env.LICENSE_KEY; // The license key from the environment variable or DB
        const licenseSecret = process.env.LICENSE_SECRET; // Secret used to validate the license JWT
        if (!licenseKey || !licenseSecret) {
            return false; // License not configured
        }
        // Verify the JWT license key
        const decoded = jsonwebtoken_1.default.verify(licenseKey, licenseSecret);
        // Check if decoded data exists
        if (!decoded?.client || !decoded?.exp) {
            return false; // Invalid license data
        }
        // Check if license has expired
        if (decoded.exp * 1000 < Date.now()) {
            return false; // License expired
        }
        return true; // License is valid and not expired
    }
    catch (err) {
        return false; // Invalid license JWT or error while verifying
    }
};
exports.isLicenseValid = isLicenseValid;
