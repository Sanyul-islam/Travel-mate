import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "travel_mate_default_access_secret_key_2026";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "travel_mate_default_refresh_secret_key_2026";

export const ACCESS_TOKEN_EXPIRY = "1h";
export const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate Access Token
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate Refresh Token
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract token from Request (Authorization header or Cookie)
 */
export function extractToken(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // Check cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
    if (cookies.accessToken) {
      return cookies.accessToken;
    }
  }

  return null;
}
