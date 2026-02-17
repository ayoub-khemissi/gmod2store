import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireNotBanned } from "@/lib/auth";
import { getProductById, getProductImages } from "@/services/product.service";
import { execute, query } from "@/lib/db";
import { saveImage, deleteFile } from "@/services/upload.service";

export async function POST(
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

    const existingImages = await getProductImages(product.id);

    if (existingImages.length >= 10) {
      throw ApiError.badRequest("Maximum 10 images per product");
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      throw ApiError.badRequest("No image provided");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveImage(buffer, file.name);
    const sortOrder = existingImages.length;

    await execute(
      "INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)",
      [product.id, url, sortOrder],
    );

    // Set as thumbnail if first image
    if (sortOrder === 0) {
      await execute("UPDATE products SET thumbnail_url = ? WHERE id = ?", [
        url,
        product.id,
      ]);
    }

    return apiSuccess({ url, sort_order: sortOrder }, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
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

    const imageId = request.nextUrl.searchParams.get("imageId");

    if (!imageId) {
      throw ApiError.badRequest("imageId is required");
    }

    const images = await query<
      ({ id: number; url: string } & import("mysql2/promise").RowDataPacket)[]
    >("SELECT id, url FROM product_images WHERE id = ? AND product_id = ?", [
      imageId,
      product.id,
    ]);

    if (!images[0]) {
      throw ApiError.notFound("Image not found");
    }

    await deleteFile(images[0].url);
    await execute("DELETE FROM product_images WHERE id = ?", [images[0].id]);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
