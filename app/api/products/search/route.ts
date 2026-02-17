import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { searchProducts } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";

    if (q.length < 2) {
      return apiSuccess([]);
    }

    const suggestions = await searchProducts(q, 6);

    return apiSuccess(suggestions);
  } catch (error) {
    return apiError(error);
  }
}
