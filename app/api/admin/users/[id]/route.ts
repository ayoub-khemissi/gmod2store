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

    const updates: string[] = [];
    const values: (string | boolean)[] = [];

    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role)) {
        throw ApiError.badRequest("Invalid role");
      }
      if (userId === session.user.id) {
        throw ApiError.badRequest("You cannot change your own role");
      }
      updates.push("role = ?");
      values.push(body.role);
    }

    if (body.is_banned !== undefined) {
      if (typeof body.is_banned !== "boolean") {
        throw ApiError.badRequest("is_banned must be a boolean");
      }
      updates.push("is_banned = ?");
      values.push(body.is_banned);
    }

    if (updates.length === 0) {
      throw ApiError.badRequest("No valid fields to update");
    }

    values.push(String(userId));
    await execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
