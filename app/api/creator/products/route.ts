import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireNotBanned } from "@/lib/auth";
import { getCreatorProducts } from "@/services/creator.service";
import { createProduct } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireNotBanned();
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const products = await getCreatorProducts(session.user.id, status);

    return apiSuccess(products);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireNotBanned();
    const body = await request.json();

    const product = await createProduct({
      seller_id: session.user.id,
      title: body.title,
      slug: body.slug,
      description: body.description,
      price: body.price ?? 0,
      category: body.category,
      tags: body.tags,
    });

    return apiSuccess(product, 201);
  } catch (error) {
    return apiError(error);
  }
}
