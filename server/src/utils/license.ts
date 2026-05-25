import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


/**
 * Check if license key is valid & not expired
 */
export const isLicenseValid = (): boolean => {
  try {
    const licenseKey = process.env.LICENSE_KEY; // The license key from the environment variable or DB
    const licenseSecret = process.env.LICENSE_SECRET; // Secret used to validate the license JWT

    if (!licenseKey || !licenseSecret) {
      return false; // License not configured
    }

    // Verify the JWT license key
    const decoded = jwt.verify(licenseKey, licenseSecret) as {
      client: string;  // Identifies the client (could be user email or unique ID)
      exp: number;     // Expiry timestamp of the license
    };

    // Check if decoded data exists
    if (!decoded?.client || !decoded?.exp) {
      return false; // Invalid license data
    }

    // Check if license has expired
    if (decoded.exp * 1000 < Date.now()) {
      return false; // License expired
    }

    return true; // License is valid and not expired
  } catch (err) {
    return false; // Invalid license JWT or error while verifying
  }
};
