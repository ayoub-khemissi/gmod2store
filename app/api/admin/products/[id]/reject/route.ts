import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireRole } from "@/lib/auth";
import { getProductById, updateProduct } from "@/services/product.service";
import { createNotification } from "@/services/notification.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const product = await getProductById(Number(id));

    if (!product) throw ApiError.notFound("Product not found");

    const body = await request.json();

    await updateProduct(product.id, { status: "rejected" });

    await createNotification({
      user_id: product.seller_id,
      type: "product_rejected",
      title: `"${product.title}" was rejected`,
      message: body.reason ?? "Your product did not meet our guidelines.",
      link: `/creator`,
    });

    return apiSuccess({ rejected: true });
  } catch (error) {
    return apiError(error);
  }
}
