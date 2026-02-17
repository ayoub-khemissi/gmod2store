import { apiSuccess, apiError } from "@/lib/api-response";
import { requireNotBanned } from "@/lib/auth";
import { getCreatorStats } from "@/services/creator.service";

export async function GET() {
  try {
    const session = await requireNotBanned();
    const stats = await getCreatorStats(session.user.id);

    return apiSuccess(stats);
  } catch (error) {
    return apiError(error);
  }
}
