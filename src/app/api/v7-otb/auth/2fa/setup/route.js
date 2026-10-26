import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { authenticateRequest } from "@/lib/auth-middleware";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    // Generate fresh TOTP secret
    const secret = generateSecret();

    // CRITICAL REQUIREMENT: Issuer name set to OrbitTrail
    const uri = generateURI({
      secret,
      label: user.email,
      issuer: "OrbitTrail",
    });

    // Generate QR Code data URL
    const qrCode = await QRCode.toDataURL(uri, {
      width: 256,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    // Store temporary secret until verified
    user.tempTwoFactorSecret = secret;
    await user.save();

    return apiSuccess(
      {
        secret,
        qrCode,
        uri,
        issuer: "OrbitTrail",
      },
      "2FA setup initialized. Scan the QR code with your authenticator app."
    );
  } catch (err) {
    console.error("2FA setup error:", err);
    return apiError("Failed to initialize 2FA setup.", 500);
  }
}
