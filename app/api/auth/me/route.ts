import { getSession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return apiSuccess(null);
  }

  return apiSuccess({
    id: session.user.id,
    username: session.user.username,
    avatar_url: session.user.avatar_url,
    role: session.user.role,
    is_banned: session.user.is_banned,
    slug: session.user.slug,
  });
}
