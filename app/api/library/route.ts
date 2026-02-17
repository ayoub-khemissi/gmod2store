import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getUserLibrary } from "@/services/library.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const items = await getUserLibrary(session.user.id);

    return apiSuccess(items);
  } catch (error) {
    return apiError(error);
  }
}
