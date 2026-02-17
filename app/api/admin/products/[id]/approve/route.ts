import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/auth";
import { getProductById, updateProduct } from "@/services/product.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const product = await getProductById(Number(id));

    if (!product) throw ApiError.notFound("Product not found");

    await updateProduct(product.id, { status: "published" });

    return apiSuccess({ approved: true });
  } catch (error) {
    return apiError(error);
  }
}
