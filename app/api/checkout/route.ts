import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { getProductById } from "@/services/product.service";
import { hasUserPurchased } from "@/services/review.service";
import { createCheckoutSession } from "@/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      throw ApiError.badRequest("productId is required");
    }

    const product = await getProductById(productId);

    if (!product || product.status !== "published") {
      throw ApiError.notFound("Product not found");
    }

    if (product.seller_id === session.user.id) {
      throw ApiError.badRequest("You cannot buy your own product");
    }

    const alreadyOwned = await hasUserPurchased(session.user.id, product.id);

    if (alreadyOwned) {
      throw ApiError.badRequest("You already own this product");
    }

    const checkoutUrl = await createCheckoutSession(
      session.user.id,
      product.id,
      product.title,
      product.price,
      product.seller_id,
    );

    return apiSuccess({ url: checkoutUrl });
  } catch (error) {
    return apiError(error);
  }
}
