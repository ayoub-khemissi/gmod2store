import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import {
  getProductBySlug,
  getProductImages,
  getProductVersions,
} from "@/services/product.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    const [images, versions] = await Promise.all([
      getProductImages(product.id),
      getProductVersions(product.id),
    ]);

    return apiSuccess({ product, images, versions });
  } catch (error) {
    return apiError(error);
  }
}
