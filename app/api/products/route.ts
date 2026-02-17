import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { getProducts } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const result = await getProducts({
      category: params.get("category") ?? undefined,
      search: params.get("search") ?? undefined,
      minPrice: params.has("minPrice")
        ? Number(params.get("minPrice"))
        : undefined,
      maxPrice: params.has("maxPrice")
        ? Number(params.get("maxPrice"))
        : undefined,
      minRating: params.has("minRating")
        ? Number(params.get("minRating"))
        : undefined,
      sort: (params.get("sort") as "newest" | "popular" | "price_asc" | "price_desc" | "rating") ?? undefined,
      page: params.has("page") ? Number(params.get("page")) : 1,
      limit: params.has("limit") ? Number(params.get("limit")) : 20,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
