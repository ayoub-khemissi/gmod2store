import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { execute } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

const VALID_ROLES = ["buyer", "creator", "admin"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = await params;
    const userId = parseInt(id, 10);
    const body = await request.json();

    if (!body.role || !VALID_ROLES.includes(body.role)) {
      throw ApiError.badRequest("Invalid role");
    }

    if (userId === session.user.id) {
      throw ApiError.badRequest("You cannot change your own role");
    }

    await execute("UPDATE users SET role = ? WHERE id = ?", [
      body.role,
      userId,
    ]);

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
