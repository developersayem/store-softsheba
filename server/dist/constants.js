"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LMS_URL = exports.CODE_EXPIRES_MINUTES = exports.RESEND_VERIFICATION_CODE_INTERVAL_MINUTES = void 0;
// Database name
// Verification Code Interval
// This is the interval in minutes after which a user can request a new verification code
exports.RESEND_VERIFICATION_CODE_INTERVAL_MINUTES = 2;
// Verification Code Expiry Time
exports.CODE_EXPIRES_MINUTES = 10;
exports.LMS_URL = "http://localhost:5050/api/v1/licenses/validate"; //todo: change the url
