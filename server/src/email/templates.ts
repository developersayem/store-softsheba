export const otpTemplate = (code: string, storeName?: string): string => {
  const brandName = storeName || process.env.PLATFORM_NAME || "SHOPXET";

  return `
    <div style="background:#f9f9f9;padding:40px;font-family:Arial,sans-serif;color:#000;">
      <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
        <div style="background:#000;padding:20px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">${brandName}</h1>
        </div>
        <div style="padding:30px;">
          <h2>Your Verification Code</h2>
          <p>Please use the code below to login securely:</p>
          <div style="text-align:center;margin:20px 0;">
            <span style="display:inline-block;font-size:28px;font-weight:bold;letter-spacing:6px;color:#000;padding:12px 24px;border:2px dashed #000;border-radius:6px;">
              ${code}
            </span>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
        </div>
        <div style="background:#f2f2f2;padding:16px;text-align:center;font-size:12px;color:#666;">
          <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </div>
  `;
};

