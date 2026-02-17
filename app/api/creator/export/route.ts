import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { getPerProductBreakdown } from "@/services/creator.service";

export async function GET() {
  try {
    const session = await requireRole(["creator", "admin"]);
    const data = await getPerProductBreakdown(session.user.id);

    const header = "Product,Sales,Revenue,Rating,Views\n";
    const rows = data
      .map(
        (d) =>
          `"${d.title}",${d.sales_count},${d.revenue},${d.average_rating},${d.view_count}`,
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sales-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
