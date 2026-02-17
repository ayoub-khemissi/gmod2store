import { RowDataPacket } from "mysql2/promise";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import type { GuardReport } from "@/types/guard";

interface GuardRow extends RowDataPacket, GuardReport {
  product_title: string;
  seller_username: string;
}

export async function GET() {
  try {
    await requireRole(["admin"]);

    const reports = await query<GuardRow[]>(
      `SELECT gr.*, p.title as product_title, u.username as seller_username
       FROM guard_reports gr
       JOIN products p ON p.id = gr.product_id
       JOIN users u ON u.id = p.seller_id
       ORDER BY gr.created_at DESC
       LIMIT 50`,
    );

    return apiSuccess(reports);
  } catch (error) {
    return apiError(error);
  }
}
