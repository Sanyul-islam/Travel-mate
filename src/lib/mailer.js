import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "OrbitTrail <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Sends an email verification message.
 * MANDATORY REQUIREMENT: Sign-off must end with: Safe travels, The Orbit Crew.
 */
export async function sendVerificationEmail({ email, name, token }) {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const subject = "Verify your OrbitTrail account";
  const textBody = `Hello ${name || "Traveler"},

Welcome to OrbitTrail! Please verify your email address to activate your account.

Click the link below or paste it into your browser to confirm:
${verifyUrl}

Verification Token: ${token}

This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.

Safe travels, The Orbit Crew.`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your OrbitTrail account</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
      <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700;">OrbitTrail</h1>
    </div>
    <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin-top: 0;">Welcome, ${name || "Traveler"}!</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
      Thank you for registering with OrbitTrail. Your account remains inactive until your email address is verified.
    </p>
    <div style="margin: 30px 0; text-align: center;">
      <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
        Verify Email Address
      </a>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
      Or copy and paste this link into your browser:<br/>
      <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
    </p>
    <div style="margin-top: 24px; padding: 12px 16px; background-color: #f1f5f9; border-radius: 6px; font-size: 13px; color: #334155;">
      <strong>Token:</strong> <code style="font-family: monospace; font-size: 14px;">${token}</code>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 20px;" />
    <p style="color: #334155; font-size: 14px; margin: 0; font-weight: 500;">
      Safe travels, The Orbit Crew.
    </p>
  </div>
</body>
</html>
`;

  // Always log for local development visibility
  console.log(`\n================= [VERIFICATION EMAIL] =================`);
  console.log(`To: ${email}`);
  console.log(`Verify URL: ${verifyUrl}`);
  console.log(`Token: ${token}`);
  console.log(`Sign-off: Safe travels, The Orbit Crew.`);
  console.log(`========================================================\n`);

  if (resend) {
    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject,
        text: textBody,
        html: htmlBody,
      });
      return { success: true, data, verifyUrl };
    } catch (err) {
      console.warn("Resend email delivery failed, falling back to local link:", err.message);
      return { success: true, localOnly: true, verifyUrl, error: err.message };
    }
  }

  return { success: true, localOnly: true, verifyUrl };
}
