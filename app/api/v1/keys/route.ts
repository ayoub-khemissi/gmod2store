import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@/services/api-key.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const keys = await listApiKeys(session.user.id);

    return apiSuccess(keys);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    if (!body.name?.trim()) {
      throw ApiError.badRequest("API key name is required");
    }

    const { apiKey, fullKey } = await createApiKey(
      session.user.id,
      body.name.trim(),
    );

    return apiSuccess({ ...apiKey, full_key: fullKey }, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const keyId = request.nextUrl.searchParams.get("id");

    if (!keyId) {
      throw ApiError.badRequest("Key ID is required");
    }

    await revokeApiKey(Number(keyId), session.user.id);

    return apiSuccess({ revoked: true });
  } catch (error) {
    return apiError(error);
  }
}
