import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  const response = apiSuccess({}, "Logged out successfully");

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
