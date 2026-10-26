import bcrypt from "bcryptjs";
import { authenticateRequest } from "@/lib/auth-middleware";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return apiError("Account password is required to disable 2FA.", 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return apiError("Incorrect password.", 401);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.tempTwoFactorSecret = null;
    await user.save();

    return apiSuccess(
      { twoFactorEnabled: false },
      "Two-factor authentication has been disabled."
    );
  } catch (err) {
    console.error("2FA disable error:", err);
    return apiError("Failed to disable 2FA.", 500);
  }
}
