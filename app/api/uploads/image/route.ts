import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { saveImage } from "@/services/upload.service";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      throw ApiError.badRequest("No image file provided");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw ApiError.badRequest("Image too large. Maximum 10MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveImage(buffer, file.name);

    return apiSuccess({ url }, 201);
  } catch (error) {
    return apiError(error);
  }
}
