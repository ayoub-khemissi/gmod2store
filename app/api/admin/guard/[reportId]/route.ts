import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/auth";
import { getGuardReport } from "@/services/guard";
import { execute } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { reportId } = await params;
    const report = await getGuardReport(Number(reportId));

    if (!report) throw ApiError.notFound("Report not found");

    return apiSuccess(report);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { reportId } = await params;
    const body = await request.json();

    // Manual override
    await execute("UPDATE guard_reports SET status = 'override' WHERE id = ?", [
      Number(reportId),
    ]);

    return apiSuccess({ overridden: true });
  } catch (error) {
    return apiError(error);
  }
}
