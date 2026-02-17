import type { Review } from "@/types/review";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface ReviewRow extends RowDataPacket, Review {}

interface ReviewWithUserRow extends RowDataPacket {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
  username: string;
  avatar_url: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export async function getProductReviews(
  productId: number,
  page = 1,
  limit = 10,
): Promise<{ reviews: ReviewWithUserRow[]; total: number }> {
  const offset = (page - 1) * limit;

  const countRows = await query<CountRow[]>(
    "SELECT COUNT(*) as total FROM reviews WHERE product_id = ?",
    [productId],
  );

  const reviews = await query<ReviewWithUserRow[]>(
    `SELECT r.*, u.username, u.avatar_url
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [productId, limit, offset],
  );

  return { reviews, total: countRows[0]?.total ?? 0 };
}

export async function createReview(data: {
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
}): Promise<Review> {
  const result = await execute(
    "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
    [data.product_id, data.user_id, data.rating, data.comment],
  );

  // Update product average rating
  await execute(
    `UPDATE products SET
      average_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
     WHERE id = ?`,
    [data.product_id, data.product_id, data.product_id],
  );

  const rows = await query<ReviewRow[]>("SELECT * FROM reviews WHERE id = ?", [
    result.insertId,
  ]);

  return rows[0]!;
}

export async function hasUserPurchased(
  userId: number,
  productId: number,
): Promise<boolean> {
  const rows = await query<CountRow[]>(
    "SELECT COUNT(*) as total FROM licenses WHERE user_id = ? AND product_id = ? AND is_active = TRUE",
    [userId, productId],
  );

  return (rows[0]?.total ?? 0) > 0;
}

export async function hasUserReviewed(
  userId: number,
  productId: number,
): Promise<boolean> {
  const rows = await query<CountRow[]>(
    "SELECT COUNT(*) as total FROM reviews WHERE user_id = ? AND product_id = ?",
    [userId, productId],
  );

  return (rows[0]?.total ?? 0) > 0;
}
