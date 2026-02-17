import { RowDataPacket } from "mysql2/promise";
import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";

interface ProductRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  price: number;
  seller_username: string;
  seller_id: number;
  created_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const status = request.nextUrl.searchParams.get("status") ?? "pending";

    const products = await query<ProductRow[]>(
      `SELECT p.id, p.title, p.slug, p.category, p.status, p.price, p.created_at,
              u.username as seller_username, u.id as seller_id
       FROM products p
       JOIN users u ON u.id = p.seller_id
       WHERE p.status = ?
       ORDER BY p.created_at DESC`,
      [status],
    );

    return apiSuccess(products);
  } catch (error) {
    return apiError(error);
  }
}
