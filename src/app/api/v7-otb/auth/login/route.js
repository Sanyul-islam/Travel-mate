import bcrypt from "bcryptjs";
import { verifySync } from "otplib";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { apiError, apiSuccess, apiResponse } from "@/lib/api-response";
import { signAccessToken, signRefreshToken, verifyAccessToken } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  code: z.string().optional(),
  tempToken: z.string().optional(),
});

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError("Invalid request payload", 400);
    }

    const { email, password, code, tempToken } = parseResult.data;

    await connectDB();

    let user;

    // Flow A: Completing 2FA with tempToken and TOTP code
    if (tempToken && code) {
      const decoded = verifyAccessToken(tempToken);
      if (!decoded || decoded.type !== "2fa_challenge" || !decoded.id) {
        return apiError("Invalid or expired 2FA session. Please log in again.", 401);
      }

      user = await User.findById(decoded.id);
      if (!user) {
        return apiError("User not found.", 404);
      }

      // Verify TOTP code
      const isTotpValid = verifySync({
        secret: user.twoFactorSecret,
        token: code.trim(),
      });

      if (!isTotpValid?.valid && isTotpValid !== true) {
        return apiError("Invalid 2FA verification code.", 401);
      }
    } else {
      // Flow B: Initial login with email and password
      if (!email || !password) {
        return apiError("Email and password are required.", 400);
      }

      user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return apiError("Invalid email or password.", 401);
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return apiError("Invalid email or password.", 401);
      }

      // Check if email is verified
      if (!user.isVerified) {
        return apiError(
          "Your email address is not verified yet. Please check your inbox and verify your email before logging in.",
          403,
          { unverified: true }
        );
      }

      // Check if 2FA is enabled on account
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        // If code was provided directly in login request
        if (code) {
          const isTotpValid = verifySync({
            secret: user.twoFactorSecret,
            token: code.trim(),
          });

          if (!isTotpValid?.valid && isTotpValid !== true) {
            return apiError("Invalid 2FA code.", 401);
          }
        } else {
          // Issue short-lived challenge token for 2FA step
          const tempToken = signAccessToken({
            id: user._id.toString(),
            type: "2fa_challenge",
          });

          return apiSuccess(
            {
              requires2FA: true,
              tempToken,
              email: user.email,
            },
            "2FA authentication required. Please provide your TOTP authenticator code.",
            200
          );
        }
      }
    }

    // Generate tokens
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTP-only cookies
    const response = apiSuccess(
      {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
      "Login successful! Welcome back."
    );

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return apiError("An unexpected error occurred during login.", 500);
  }
}
