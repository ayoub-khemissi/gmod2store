import { RowDataPacket } from "mysql2/promise";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";

interface CountRow extends RowDataPacket {
  total: number;
}

interface RevenueRow extends RowDataPacket {
  total: number;
}

export async function GET() {
  try {
    await requireRole(["admin"]);

    const [users, products, pending, revenue, tickets, contacts] =
      await Promise.all([
        query<CountRow[]>("SELECT COUNT(*) as total FROM users"),
        query<CountRow[]>(
          "SELECT COUNT(*) as total FROM products WHERE status = 'published'",
        ),
        query<CountRow[]>(
          "SELECT COUNT(*) as total FROM products WHERE status = 'pending'",
        ),
        query<RevenueRow[]>(
          "SELECT COALESCE(SUM(platform_fee), 0) as total FROM transactions WHERE status = 'completed'",
        ),
        query<CountRow[]>(
          "SELECT COUNT(*) as total FROM tickets WHERE status IN ('open', 'escalated')",
        ),
        query<CountRow[]>(
          "SELECT COUNT(*) as total FROM contacts WHERE is_resolved = FALSE",
        ),
      ]);

    return apiSuccess({
      totalUsers: users[0]?.total ?? 0,
      publishedProducts: products[0]?.total ?? 0,
      pendingProducts: pending[0]?.total ?? 0,
      totalRevenue: revenue[0]?.total ?? 0,
      openTickets: tickets[0]?.total ?? 0,
      unresolvedContacts: contacts[0]?.total ?? 0,
    });
  } catch (error) {
    return apiError(error);
  }
}
