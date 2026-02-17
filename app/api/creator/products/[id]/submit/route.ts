import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireNotBanned } from "@/lib/auth";
import { getProductById, updateProduct } from "@/services/product.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireNotBanned();
    const { id } = await params;
    const product = await getProductById(Number(id));

    if (!product || product.seller_id !== session.user.id) {
      throw ApiError.notFound("Product not found");
    }

    if (product.status !== "draft") {
      throw ApiError.badRequest("Only draft products can be submitted");
    }

    await updateProduct(product.id, { status: "pending" });

    // Guard pipeline will be triggered in Phase 8
    // For now, just mark as pending

    return apiSuccess({ status: "pending" });
  } catch (error) {
    return apiError(error);
  }
}
