import connectDB from "@/lib/db";
import User from "@/models/User";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body?.token;

    if (!token) {
      return apiError("Verification token is required.", 400);
    }

    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return apiError("Invalid or expired verification token.", 400);
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return apiSuccess(
      {
        email: user.email,
        isVerified: true,
      },
      "Email address verified successfully! You can now log in."
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return apiError("An unexpected error occurred during email verification.", 500);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return apiError("Verification token is required.", 400);
  }

  try {
    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return apiError("Invalid or expired verification token.", 400);
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return apiSuccess(
      {
        email: user.email,
        isVerified: true,
      },
      "Email address verified successfully! You can now log in."
    );
  } catch (error) {
    console.error("Email verification GET error:", error);
    return apiError("An unexpected error occurred during email verification.", 500);
  }
}
