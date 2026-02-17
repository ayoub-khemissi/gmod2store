import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { getContacts } from "@/services/contact.service";

export async function GET() {
  try {
    await requireRole(["admin"]);

    const contacts = await getContacts();

    return apiSuccess(contacts);
  } catch (error) {
    return apiError(error);
  }
}
