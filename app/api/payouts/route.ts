import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2/promise";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireNotBanned } from "@/lib/auth";
import { query } from "@/lib/db";
import { requestPayout } from "@/services/payment.service";
import type { Payout } from "@/types/payment";

interface PayoutRow extends RowDataPacket, Payout {}

export async function GET() {
  try {
    const session = await requireNotBanned();
    const payouts = await query<PayoutRow[]>(
      "SELECT * FROM payouts WHERE seller_id = ? ORDER BY created_at DESC",
      [session.user.id],
    );

    return apiSuccess(payouts);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireNotBanned();
    const body = await request.json();

    if (!body.amount || body.amount <= 0) {
      throw ApiError.badRequest("Invalid payout amount");
    }

    await requestPayout(session.user.id, body.amount);

    return apiSuccess({ requested: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}
