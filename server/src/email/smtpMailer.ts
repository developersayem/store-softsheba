import nodemailer from "nodemailer";

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // secure if 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendSMTPMail = async (to: string, subject: string, html: string) => {
  const platformName = process.env.PLATFORM_NAME || "SHOPXET";

  await smtpTransporter.sendMail({
    from: `"${platformName} Security" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
