import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { resolveContact } from "@/services/contact.service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    await resolveContact(parseInt(id, 10));

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
