import { connectDB } from "./db";
import { extractToken, verifyAccessToken } from "./jwt";
import User from "../models/User";
import { apiError } from "./api-response";

/**
 * Authenticates an incoming request.
 * Returns { user } if authenticated, or { error: NextResponse } if not.
 */
export async function authenticateRequest(request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return {
        user: null,
        error: apiError("Authentication required. Please provide a valid Bearer token.", 401),
      };
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      return {
        user: null,
        error: apiError("Invalid or expired session token. Please log in again.", 401),
      };
    }

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return {
        user: null,
        error: apiError("User not found or account removed.", 401),
      };
    }

    if (!user.isVerified) {
      return {
        user: null,
        error: apiError("Email not verified. Please verify your email first.", 403),
      };
    }

    return { user, error: null };
  } catch (err) {
    console.error("Auth middleware error:", err);
    return {
      user: null,
      error: apiError("Authentication failed due to server error.", 500),
    };
  }
}
