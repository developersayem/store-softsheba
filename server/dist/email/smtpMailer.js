"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMTPMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const smtpTransporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // secure if 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendSMTPMail = async (to, subject, html) => {
    const platformName = process.env.PLATFORM_NAME || "SHOPXET";
    await smtpTransporter.sendMail({
        from: `"${platformName} Security" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
};
exports.sendSMTPMail = sendSMTPMail;
