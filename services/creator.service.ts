import type { Product } from "@/types/product";
import type { User } from "@/types/user";

import { RowDataPacket } from "mysql2/promise";

import { query } from "@/lib/db";

interface ProductRow extends RowDataPacket, Product {}
interface UserRow extends RowDataPacket, User {}

interface StatsRow extends RowDataPacket {
  total_products: number;
  total_sales: number;
  total_revenue: number;
  total_views: number;
  average_rating: number;
}

interface SalesTrendRow extends RowDataPacket {
  date: string;
  sales: number;
  revenue: number;
}

interface PerProductRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  sales_count: number;
  revenue: number;
  average_rating: number;
  view_count: number;
}

export async function getCreatorProducts(
  sellerId: number,
  status?: string,
): Promise<Product[]> {
  if (status) {
    return query<ProductRow[]>(
      "SELECT * FROM products WHERE seller_id = ? AND status = ? ORDER BY created_at DESC",
      [sellerId, status],
    );
  }

  return query<ProductRow[]>(
    "SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC",
    [sellerId],
  );
}

export async function getCreatorStats(sellerId: number): Promise<StatsRow> {
  const rows = await query<StatsRow[]>(
    `SELECT
      COUNT(*) as total_products,
      COALESCE(SUM(p.sales_count), 0) as total_sales,
      COALESCE(SUM(t.seller_amount), 0) as total_revenue,
      COALESCE(SUM(p.view_count), 0) as total_views,
      COALESCE(AVG(NULLIF(p.average_rating, 0)), 0) as average_rating
    FROM products p
    LEFT JOIN transactions t ON t.product_id = p.id AND t.status = 'completed'
    WHERE p.seller_id = ?`,
    [sellerId],
  );

  return (
    rows[0] ?? {
      total_products: 0,
      total_sales: 0,
      total_revenue: 0,
      total_views: 0,
      average_rating: 0,
    }
  );
}

export async function getSalesTrends(
  sellerId: number,
  period: "daily" | "weekly" | "monthly" = "daily",
  days = 30,
): Promise<SalesTrendRow[]> {
  const groupBy = {
    daily: "DATE(t.created_at)",
    weekly: "YEARWEEK(t.created_at, 1)",
    monthly: "DATE_FORMAT(t.created_at, '%Y-%m')",
  };

  return query<SalesTrendRow[]>(
    `SELECT
      ${groupBy[period]} as date,
      COUNT(*) as sales,
      COALESCE(SUM(t.seller_amount), 0) as revenue
    FROM transactions t
    JOIN products p ON p.id = t.product_id
    WHERE p.seller_id = ? AND t.status = 'completed' AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY date
    ORDER BY date ASC`,
    [sellerId, days],
  );
}

export async function getPerProductBreakdown(
  sellerId: number,
): Promise<PerProductRow[]> {
  return query<PerProductRow[]>(
    `SELECT
      p.id, p.title, p.slug, p.sales_count, p.average_rating, p.view_count,
      COALESCE(SUM(t.seller_amount), 0) as revenue
    FROM products p
    LEFT JOIN transactions t ON t.product_id = p.id AND t.status = 'completed'
    WHERE p.seller_id = ?
    GROUP BY p.id
    ORDER BY revenue DESC`,
    [sellerId],
  );
}

export async function getCreatorBySlug(slug: string): Promise<User | null> {
  const rows = await query<UserRow[]>(
    "SELECT * FROM users WHERE slug = ? AND role IN ('creator', 'admin') LIMIT 1",
    [slug],
  );

  return rows[0] ?? null;
}

export async function updateCreatorProfile(
  userId: number,
  data: {
    bio?: string;
    banner_url?: string;
    slug?: string;
    social_links?: Record<string, string>;
  },
): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(key === "social_links" ? JSON.stringify(value) : value);
    }
  }

  if (fields.length === 0) return;
  values.push(userId);

  await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
}
