import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { getDownloadUrl } from "@/services/library.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ licenseId: string }> },
) {
  try {
    const session = await requireAuth();
    const { licenseId } = await params;
    const versionId = request.nextUrl.searchParams.get("versionId");

    const url = await getDownloadUrl(
      Number(licenseId),
      session.user.id,
      versionId ? Number(versionId) : undefined,
    );

    if (!url) {
      throw ApiError.notFound("Download not available");
    }

    return apiSuccess({ url });
  } catch (error) {
    return apiError(error);
  }
}
