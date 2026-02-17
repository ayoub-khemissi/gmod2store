import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireNotBanned } from "@/lib/auth";
import { getSalesTrends } from "@/services/creator.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireNotBanned();
    const period =
      (request.nextUrl.searchParams.get("period") as
        | "daily"
        | "weekly"
        | "monthly") ?? "daily";
    const days = Number(request.nextUrl.searchParams.get("days") ?? "30");
    const trends = await getSalesTrends(session.user.id, period, days);

    return apiSuccess(trends);
  } catch (error) {
    return apiError(error);
  }
}
