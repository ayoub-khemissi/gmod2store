import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireNotBanned } from "@/lib/auth";
import {
  getProductById,
  getProductImages,
  updateProduct,
} from "@/services/product.service";

export async function GET(
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

    const images = await getProductImages(product.id);

    return apiSuccess({ ...product, images });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireNotBanned();
    const { id } = await params;
    const product = await getProductById(Number(id));

    if (!product || product.seller_id !== session.user.id) {
      throw ApiError.notFound("Product not found");
    }

    const body = await request.json();

    await updateProduct(product.id, {
      title: body.title,
      slug: body.slug,
      description: body.description,
      price: body.price,
      category: body.category,
      thumbnail_url: body.thumbnail_url,
      tags: body.tags,
    });

    const updated = await getProductById(product.id);

    return apiSuccess(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
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

    if (product.status === "published") {
      throw ApiError.badRequest("Cannot delete a published product");
    }

    const { execute } = await import("@/lib/db");

    await execute("DELETE FROM products WHERE id = ?", [product.id]);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
