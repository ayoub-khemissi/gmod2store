import type { User } from "@/types/user";

import { RowDataPacket } from "mysql2/promise";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";

interface UserRow extends RowDataPacket, User {}

export async function GET() {
  try {
    await requireRole(["admin"]);

    const users = await query<UserRow[]>(
      "SELECT id, steam_id, username, avatar_url, role, slug, created_at FROM users ORDER BY created_at DESC",
    );

    return apiSuccess(users);
  } catch (error) {
    return apiError(error);
  }
}
