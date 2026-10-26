import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  // Ensure X-Orbit-Ref header is on all responses
  response.headers.set("X-Orbit-Ref", "ow-4821");
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
