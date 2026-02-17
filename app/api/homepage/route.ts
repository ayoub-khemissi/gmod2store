import { apiSuccess, apiError } from "@/lib/api-response";
import {
  getTrendingProducts,
  getStaffPicks,
  getTopCreators,
} from "@/services/product.service";

export async function GET() {
  try {
    const [trending, staffPicks, topCreators] = await Promise.all([
      getTrendingProducts(8),
      getStaffPicks(4),
      getTopCreators(6),
    ]);

    return apiSuccess({ trending, staffPicks, topCreators });
  } catch (error) {
    return apiError(error);
  }
}
