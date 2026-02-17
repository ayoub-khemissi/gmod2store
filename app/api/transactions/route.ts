import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getTransactionHistory } from "@/services/payment.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const transactions = await getTransactionHistory(session.user.id, "buyer");

    return apiSuccess(transactions);
  } catch (error) {
    return apiError(error);
  }
}
