import nodemailer from "nodemailer";

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendVerificationEmailParams {
  email: string;
  code: string;
  name?: string;
}

export async function sendVerificationEmail({
  email,
  code,
  name,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? name : "there";

  // Always log the code for development
  console.log(`\n========================================`);
  console.log(`VERIFICATION CODE for ${email}: ${code}`);
  console.log(`========================================\n`);

  const mailOptions = {
    from: `"SecureVault" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Your verification code - SecureVault",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 48px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 400px; margin: 0 auto;">
          
          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 40px;">
              <span style="font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">SecureVault</span>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #a1a1aa; line-height: 1.6;">
                Hey ${greeting}, here's your verification code:
              </p>
              
              <!-- Code Display -->
              <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px 16px; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">${code}</span>
              </div>
              
              <!-- Expiry -->
              <p style="margin: 0 0 32px 0; font-size: 13px; color: #71717a;">
                Expires in 10 minutes
              </p>
              
              <!-- Divider -->
              <div style="height: 1px; background-color: #27272a; margin: 0 0 24px 0;"></div>
              
              <!-- Footer -->
              <p style="margin: 0; font-size: 12px; color: #52525b; line-height: 1.6;">
                If you didn't request this code, ignore this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hey ${greeting}!\n\nYour SecureVault verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nSecurity tip: Never share this code with anyone. SecureVault will never ask for your code via phone or message.\n\nIf you didn't request this code, please ignore this email.\n\n© ${new Date().getFullYear()} SecureVault`,
  };

  // Try to send email, but always return success so the flow continues
  // This allows development without SMTP configured
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`[Email] Verification email sent to ${email}`);
    } else {
      console.log(
        `[Email] SMTP not configured - check console for verification code`,
      );
    }
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    console.log(`[Email] Use the verification code from console: ${code}`);
  }

  // Always return success - the code is logged to console for dev use
  return { success: true };
}
