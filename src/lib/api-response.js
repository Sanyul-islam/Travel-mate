import { NextResponse } from "next/server";

export const ORBIT_HEADER_KEY = "X-Orbit-Ref";
export const ORBIT_HEADER_VALUE = "ow-4821";

/**
 * Standardized API response builder that guarantees the X-Orbit-Ref: ow-4821 header
 * is present on all API responses.
 *
 * @param {any} data - Response payload
 * @param {object} options - Status code, custom headers, etc.
 */
export function apiResponse(data, options = {}) {
  const { status = 200, headers = {}, ...rest } = options;

  const combinedHeaders = new Headers(headers);
  combinedHeaders.set(ORBIT_HEADER_KEY, ORBIT_HEADER_VALUE);

  return NextResponse.json(data, {
    status,
    headers: combinedHeaders,
    ...rest,
  });
}

/**
 * Quick helper for error responses
 */
export function apiError(message, status = 400, details = null) {
  return apiResponse(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Quick helper for success responses
 */
export function apiSuccess(data = {}, message = "Success", status = 200) {
  return apiResponse(
    {
      success: true,
      message,
      ...(typeof data === "object" && !Array.isArray(data) ? data : { data }),
    },
    { status }
  );
}
