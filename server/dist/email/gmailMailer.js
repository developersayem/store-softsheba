"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGmailMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const GMAIL_USER = "noreply.shopxet@gmail.com";
const GMAIL_APP_PASSWORD = "sawgkwolbwgdemko";
const gmailTransporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});
const sendGmailMail = async (to, subject, html) => {
    const platformName = process.env.PLATFORM_NAME || "SHOPXET";
    try {
        await gmailTransporter.sendMail({
            from: `"${platformName} Security" <${GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent to ${to}`);
    }
    catch (error) {
        console.error(`❌ Gmail SMTP error:`, error);
        throw error; // re-throw so the controller returns 500 with real info
    }
};
exports.sendGmailMail = sendGmailMail;
