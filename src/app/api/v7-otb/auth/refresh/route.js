import connectDB from "@/lib/db";
import User from "@/models/User";
import { apiError, apiSuccess } from "@/lib/api-response";
import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let token = body?.refreshToken;

    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split("; ").map((c) => {
            const [k, ...v] = c.split("=");
            return [k, decodeURIComponent(v.join("="))];
          })
        );
        token = cookies.refreshToken;
      }
    }

    if (!token) {
      return apiError("Refresh token is required.", 401);
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded || !decoded.id) {
      return apiError("Invalid or expired refresh token.", 401);
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return apiError("Refresh token has been revoked or is invalid.", 401);
    }

    const newAccessToken = signAccessToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = apiSuccess(
      { accessToken: newAccessToken },
      "Session access token refreshed successfully."
    );

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Token refresh error:", err);
    return apiError("Failed to refresh session token.", 500);
  }
}
