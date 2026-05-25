import nodemailer from "nodemailer";

const GMAIL_USER = "noreply.shopxet@gmail.com";
const GMAIL_APP_PASSWORD = "sawgkwolbwgdemko";

const gmailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export const sendGmailMail = async (
  to: string,
  subject: string,
  html: string,
) => {
  const platformName = process.env.PLATFORM_NAME || "SHOPXET";

  try {
    await gmailTransporter.sendMail({
      from: `"${platformName} Security" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Gmail SMTP error:`, error);
    throw error; // re-throw so the controller returns 500 with real info
  }
};
