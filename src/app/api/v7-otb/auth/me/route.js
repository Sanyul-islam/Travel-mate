import { authenticateRequest } from "@/lib/auth-middleware";
import { apiSuccess } from "@/lib/api-response";

export async function GET(request) {
  const { user, error } = await authenticateRequest(request);
  if (error) return error;

  return apiSuccess({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    },
  });
}
