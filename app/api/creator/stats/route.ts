import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { getCreatorStats } from "@/services/creator.service";

export async function GET() {
  try {
    const session = await requireRole(["creator", "admin"]);
    const stats = await getCreatorStats(session.user.id);

    return apiSuccess(stats);
  } catch (error) {
    return apiError(error);
  }
}
