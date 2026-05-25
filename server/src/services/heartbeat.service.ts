import axios from "axios";
import dotenv from "dotenv";
import forge from "node-forge";
import os from "os";

dotenv.config();

// Obfuscated keys for "hidden" logic
const _k = "TElDRU5TRV9LRVk="; // LICENSE_KEY
const _s = "TElDRU5TRV9TRUNSRVQ="; // LICENSE_SECRET

let _v = false; // Cached validation state (Default to false)
let _pub: string | null = null; // RSA Public Key
let _lastPulse = 0; // Track last pulse time
let _metadata: {
  status: string | null;
  expirationDate: string | null;
  email: string | null;
  isValid: boolean;
  paidAmount?: number;
  totalPrice?: number;
} = {
  status: null,
  expirationDate: null,
  email: null,
  isValid: false,
};

const d = (s: string) => Buffer.from(s, "base64").toString("ascii");

let _retryCount = 0;
const MAX_RETRIES = 3;

/**
 * Gets hardware fingerprint
 */
const getFingerprint = () => {
  return Buffer.from(os.hostname() + os.cpus()[0].model).toString("hex");
};

/**
 * System health monitor (Heartbeat)
 * Periodically syncs with the security gateway
 */
export const pulse = async (force = false) => {
  try {
    const now = Date.now();
    // Throttle: Don't pulse more than once every 2 seconds unless forced
    if (!force && now - _lastPulse < 2000) return;
    _lastPulse = now;

    const k = process.env[d(_k)];
    const s = process.env[d(_s)];

    if (!k || !s) {
      _v = false;
      return;
    }

    // 1. Fetch Public Key if not exists
    if (!_pub) {
      const { data: pubResponse } = await axios.get(
        `${process.env.LMS_URL || "http://localhost:5050"}/api/v1/licenses/public-key`,
      );
      _pub = pubResponse?.data?.publicKey;
    }

    // 2. Fetch remote status with Domain/Port Binding + Fingerprint
    const { data: valResponse } = await axios.post(
      `${process.env.LMS_URL || "http://localhost:5050"}/api/v1/licenses/validate`,
      {
        licenseKey: k,
        licenseSecret: s,
        domain: process.env.ALLOWED_ORIGINS?.split(",")[0] || "localhost",
        port: process.env.PORT || 5001,
        fingerprint: getFingerprint(),
      },
    );

    if (!valResponse?.success || !valResponse?.data?.isValid) {
      _v = false;
      _metadata.isValid = false;

      const remoteStatus = valResponse?.data?.status;
      const expirationDate = valResponse?.data?.expirationDate;
      const email = valResponse?.data?.email;

      if (email) _metadata.email = email;
      if (expirationDate) _metadata.expirationDate = expirationDate;

      if (remoteStatus) {
        _metadata.status = remoteStatus;
      } else if (expirationDate) {
        const isExpired = new Date(expirationDate).getTime() < Date.now();
        _metadata.status = isExpired ? "expired" : "revoked";
      } else {
        _metadata.status = "revoked";
      }

      // Capture payment info even if invalid (for payment_pending status)
      if (valResponse?.data?.paidAmount !== undefined) {
        _metadata.paidAmount = valResponse.data.paidAmount;
      }
      if (valResponse?.data?.totalPrice !== undefined) {
        _metadata.totalPrice = valResponse.data.totalPrice;
      }

      return;
    }

    const { data } = valResponse;
    _metadata.status = data.status || "active";
    _metadata.expirationDate = data.expirationDate;
    _metadata.email = data.email;
    _metadata.paidAmount = data.paidAmount;
    _metadata.totalPrice = data.totalPrice;

    // 3. RSA local verification of the signature provided by LMS
    if (_pub && data.signature) {
      const publicKey = forge.pki.publicKeyFromPem(_pub);
      const signature = forge.util.decode64(data.signature);
      const md = forge.md.sha256.create();
      md.update(
        JSON.stringify({
          email: data.email,
          domain: data.domain,
          expirationDate: new Date(data.expirationDate).toISOString(),
        }),
        "utf8",
      );

      _v = publicKey.verify(md.digest().getBytes(), signature);
    } else {
      _v = !!(valResponse?.success && data?.isValid);
    }
    _metadata.isValid = _v;
    _retryCount = 0; // Reset on success
    console.log("License pulse success:", _metadata.status, "Valid:", _v);
  } catch (error: any) {
    console.error("License pulse failed:", error.message);

    _retryCount++;
    if (_retryCount >= MAX_RETRIES) {
      _v = false;
      _metadata.isValid = false;

      if (!_metadata.status || _metadata.status === "active") {
        _metadata.status = "connection_error";
      }
    } else {
      console.log(`License pulse retry ${_retryCount}/${MAX_RETRIES}...`);
    }
  }
};

/**
 * Manually trigger a license sync
 */
export const syncLicense = () => pulse(true);

/**
 * Returns the current system integrity state
 */
export const checkIntegrity = () => _v;

/**
 * Returns current license metadata
 */
export const getLicenseStatus = () => {
  return { ..._metadata, lastSync: _lastPulse };
};

// Start the pulse cycle
export const initHeartbeat = () => {
  const scheduleNext = () => {
    // If invalid or connection error, check faster (every 15s), otherwise every 1 minute
    const interval =
      _metadata.isValid && _metadata.status !== "connection_error"
        ? 1000 * 60 * 1
        : 1000 * 15;

    setTimeout(async () => {
      await pulse();
      scheduleNext();
    }, interval);
  };

  pulse();
  scheduleNext();
};
