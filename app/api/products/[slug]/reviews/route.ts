import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { getSession } from "@/lib/auth";
import { getProductBySlug } from "@/services/product.service";
import {
  getProductReviews,
  createReview,
  hasUserPurchased,
  hasUserReviewed,
} from "@/services/review.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const result = await getProductReviews(product.id, page);

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      throw ApiError.unauthorized();
    }

    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    const purchased = await hasUserPurchased(session.user.id, product.id);

    if (!purchased) {
      throw ApiError.forbidden("You must purchase this product before reviewing");
    }

    const reviewed = await hasUserReviewed(session.user.id, product.id);

    if (reviewed) {
      throw ApiError.badRequest("You have already reviewed this product");
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      throw ApiError.badRequest("Rating must be between 1 and 5");
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      throw ApiError.badRequest("Comment must be at least 5 characters");
    }

    const review = await createReview({
      product_id: product.id,
      user_id: session.user.id,
      rating,
      comment: comment.trim(),
    });

    return apiSuccess(review, 201);
  } catch (error) {
    return apiError(error);
  }
}
