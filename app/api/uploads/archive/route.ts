import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/auth";
import { saveArchive } from "@/services/upload.service";

const MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE ?? 500) * 1024 * 1024; // MB

export async function POST(request: NextRequest) {
  try {
    await requireRole(["creator", "admin"]);

    const formData = await request.formData();
    const file = formData.get("archive") as File | null;

    if (!file) {
      throw ApiError.badRequest("No archive file provided");
    }

    if (file.size > MAX_SIZE) {
      throw ApiError.badRequest(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { path, size } = await saveArchive(buffer, file.name);

    return apiSuccess({ url: path, file_size: size }, 201);
  } catch (error) {
    return apiError(error);
  }
}
