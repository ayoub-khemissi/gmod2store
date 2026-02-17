import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";
import type { Product, ProductImage, ProductVersion } from "@/types/product";

interface ProductRow extends RowDataPacket, Product {}
interface ProductImageRow extends RowDataPacket, ProductImage {}
interface ProductVersionRow extends RowDataPacket, ProductVersion {}
interface CountRow extends RowDataPacket {
  total: number;
}

export interface ProductFilters {
  category?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating";
  page?: number;
  limit?: number;
  sellerId?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedProducts> {
  const {
    category,
    status = "published",
    search,
    minPrice,
    maxPrice,
    minRating,
    sort = "newest",
    page = 1,
    limit = 20,
    sellerId,
  } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push("p.status = ?");
    params.push(status);
  }

  if (category) {
    conditions.push("p.category = ?");
    params.push(category);
  }

  if (sellerId) {
    conditions.push("p.seller_id = ?");
    params.push(sellerId);
  }

  if (search) {
    conditions.push("MATCH(p.title, p.description) AGAINST(? IN BOOLEAN MODE)");
    params.push(search);
  }

  if (minPrice !== undefined) {
    conditions.push("p.price >= ?");
    params.push(minPrice);
  }

  if (maxPrice !== undefined) {
    conditions.push("p.price <= ?");
    params.push(maxPrice);
  }

  if (minRating !== undefined) {
    conditions.push("p.average_rating >= ?");
    params.push(minRating);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortMap: Record<string, string> = {
    newest: "p.created_at DESC",
    popular: "p.sales_count DESC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
    rating: "p.average_rating DESC",
  };

  const orderBy = sortMap[sort] ?? "p.created_at DESC";
  const offset = (page - 1) * limit;

  const countRows = await query<CountRow[]>(
    `SELECT COUNT(*) as total FROM products p ${where}`,
    params,
  );
  const total = countRows[0]?.total ?? 0;

  const products = await query<ProductRow[]>(
    `SELECT p.* FROM products p ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await query<ProductRow[]>(
    "SELECT * FROM products WHERE slug = ? LIMIT 1",
    [slug],
  );

  return rows[0] ?? null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await query<ProductRow[]>(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] ?? null;
}

export async function getProductImages(
  productId: number,
): Promise<ProductImage[]> {
  return query<ProductImageRow[]>(
    "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
    [productId],
  );
}

export async function getProductVersions(
  productId: number,
): Promise<ProductVersion[]> {
  return query<ProductVersionRow[]>(
    "SELECT * FROM product_versions WHERE product_id = ? ORDER BY created_at DESC",
    [productId],
  );
}

export async function getTrendingProducts(
  limit = 8,
): Promise<Product[]> {
  return query<ProductRow[]>(
    "SELECT * FROM products WHERE status = 'published' ORDER BY sales_count DESC, view_count DESC LIMIT ?",
    [limit],
  );
}

export async function getStaffPicks(limit = 4): Promise<Product[]> {
  return query<ProductRow[]>(
    "SELECT * FROM products WHERE status = 'published' AND is_staff_pick = TRUE ORDER BY updated_at DESC LIMIT ?",
    [limit],
  );
}

interface CreatorRow extends RowDataPacket {
  id: number;
  username: string;
  avatar_url: string;
  slug: string | null;
  product_count: number;
  total_sales: number;
}

export async function getTopCreators(limit = 6): Promise<CreatorRow[]> {
  return query<CreatorRow[]>(
    `SELECT u.id, u.username, u.avatar_url, u.slug,
       COUNT(p.id) as product_count,
       COALESCE(SUM(p.sales_count), 0) as total_sales
     FROM users u
     JOIN products p ON p.seller_id = u.id AND p.status = 'published'
     WHERE u.role IN ('creator', 'admin')
     GROUP BY u.id
     ORDER BY total_sales DESC
     LIMIT ?`,
    [limit],
  );
}

export async function searchProducts(
  term: string,
  limit = 5,
): Promise<Pick<Product, "id" | "title" | "slug" | "category" | "thumbnail_url">[]> {
  return query<(RowDataPacket & Pick<Product, "id" | "title" | "slug" | "category" | "thumbnail_url">)[]>(
    `SELECT id, title, slug, category, thumbnail_url
     FROM products
     WHERE status = 'published' AND (title LIKE ? OR MATCH(title, description) AGAINST(? IN BOOLEAN MODE))
     LIMIT ?`,
    [`%${term}%`, term, limit],
  );
}

export async function incrementViewCount(productId: number): Promise<void> {
  await execute(
    "UPDATE products SET view_count = view_count + 1 WHERE id = ?",
    [productId],
  );
}

export async function createProduct(data: {
  seller_id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
}): Promise<Product> {
  const result = await execute(
    `INSERT INTO products (seller_id, title, slug, description, price, category, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.seller_id,
      data.title,
      data.slug,
      data.description,
      data.price,
      data.category,
      data.tags ? JSON.stringify(data.tags) : null,
    ],
  );

  return (await getProductById(result.insertId))!;
}

export async function updateProduct(
  id: number,
  data: Partial<
    Pick<
      Product,
      "title" | "slug" | "description" | "price" | "category" | "status" | "thumbnail_url" | "tags" | "is_staff_pick"
    >
  >,
): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(
        key === "tags" ? JSON.stringify(value) : value,
      );
    }
  }

  if (fields.length === 0) return;
  values.push(id);

  await execute(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
}
