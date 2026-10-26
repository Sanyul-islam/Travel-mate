import { verifySync } from "otplib";
import { authenticateRequest } from "@/lib/auth-middleware";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const code = body?.code;

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return apiError("A 6-digit TOTP verification code is required.", 400);
    }

    const secretToVerify = user.tempTwoFactorSecret || user.twoFactorSecret;
    if (!secretToVerify) {
      return apiError("No pending 2FA setup found. Please start setup again.", 400);
    }

    const verificationResult = verifySync({
      secret: secretToVerify,
      token: code.trim(),
    });

    const isValid = verificationResult?.valid === true || verificationResult === true;

    if (!isValid) {
      return apiError("Invalid verification code. Please check your authenticator app and try again.", 400);
    }

    // Activate 2FA
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secretToVerify;
    user.tempTwoFactorSecret = null;
    await user.save();

    return apiSuccess(
      {
        twoFactorEnabled: true,
      },
      "Two-factor authentication successfully enabled!"
    );
  } catch (err) {
    console.error("2FA verify error:", err);
    return apiError("Failed to verify 2FA code.", 500);
  }
}
