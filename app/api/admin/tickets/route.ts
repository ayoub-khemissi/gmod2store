import { RowDataPacket } from "mysql2/promise";
import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";

interface TicketRow extends RowDataPacket {
  id: number;
  subject: string;
  category: string;
  status: string;
  requester_username: string;
  requester_id: number;
  created_at: Date;
  updated_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const status = request.nextUrl.searchParams.get("status") ?? "escalated";

    const tickets = await query<TicketRow[]>(
      `SELECT t.id, t.subject, t.category, t.status, t.created_at, t.updated_at,
              u.username as requester_username, u.id as requester_id
       FROM tickets t
       JOIN users u ON u.id = t.requester_id
       WHERE t.status = ?
       ORDER BY t.updated_at DESC`,
      [status],
    );

    return apiSuccess(tickets);
  } catch (error) {
    return apiError(error);
  }
}
