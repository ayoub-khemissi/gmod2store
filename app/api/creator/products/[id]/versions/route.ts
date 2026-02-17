import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/auth";
import { getProductById } from "@/services/product.service";
import { createVersion, getNextVersion } from "@/services/version.service";
import { notifyBuyersOfUpdate } from "@/services/notification.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(["creator", "admin"]);
    const { id } = await params;
    const product = await getProductById(Number(id));

    if (!product || product.seller_id !== session.user.id) {
      throw ApiError.notFound("Product not found");
    }

    const body = await request.json();
    const version =
      body.version ?? (await getNextVersion(product.id));

    const newVersion = await createVersion({
      product_id: product.id,
      version,
      changelog: body.changelog ?? "",
      archive_url: body.archive_url,
      file_size: body.file_size ?? 0,
    });

    // Notify buyers if product is published
    if (product.status === "published") {
      notifyBuyersOfUpdate(
        product.id,
        product.title,
        version,
      ).catch(() => {});
    }

    return apiSuccess(newVersion, 201);
  } catch (error) {
    return apiError(error);
  }
}
