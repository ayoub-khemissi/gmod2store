import { RowDataPacket } from "mysql2/promise";

import { query } from "@/lib/db";

interface LibraryItemRow extends RowDataPacket {
  license_id: number;
  license_key: string;
  product_id: number;
  title: string;
  slug: string;
  category: string;
  thumbnail_url: string | null;
  seller_username: string;
  current_version: string | null;
  current_version_date: Date | null;
  purchased_at: Date;
  has_update: number;
}

export interface LibraryItem {
  license_id: number;
  license_key: string;
  product_id: number;
  title: string;
  slug: string;
  category: string;
  thumbnail_url: string | null;
  seller_username: string;
  current_version: string | null;
  current_version_date: Date | null;
  purchased_at: Date;
  has_update: boolean;
}

export async function getUserLibrary(userId: number): Promise<LibraryItem[]> {
  const rows = await query<LibraryItemRow[]>(
    `SELECT
      l.id as license_id,
      l.license_key,
      p.id as product_id,
      p.title,
      p.slug,
      p.category,
      p.thumbnail_url,
      u.username as seller_username,
      pv.version as current_version,
      pv.created_at as current_version_date,
      l.created_at as purchased_at,
      CASE WHEN pv.created_at > l.created_at THEN 1 ELSE 0 END as has_update
    FROM licenses l
    JOIN products p ON p.id = l.product_id
    JOIN users u ON u.id = p.seller_id
    LEFT JOIN product_versions pv ON pv.product_id = p.id
      AND pv.id = (SELECT id FROM product_versions WHERE product_id = p.id ORDER BY created_at DESC LIMIT 1)
    WHERE l.user_id = ? AND l.is_active = TRUE
    ORDER BY l.created_at DESC`,
    [userId],
  );

  return rows.map((r) => ({
    ...r,
    has_update: Boolean(r.has_update),
  }));
}

export async function getDownloadUrl(
  licenseId: number,
  userId: number,
  versionId?: number,
): Promise<string | null> {
  // Verify ownership
  const licenses = await query<(RowDataPacket & { product_id: number })[]>(
    "SELECT product_id FROM licenses WHERE id = ? AND user_id = ? AND is_active = TRUE",
    [licenseId, userId],
  );

  if (!licenses[0]) return null;

  const productId = licenses[0].product_id;

  // Get the version archive URL
  let sql: string;
  let params: unknown[];

  if (versionId) {
    sql =
      "SELECT archive_url FROM product_versions WHERE id = ? AND product_id = ?";
    params = [versionId, productId];
  } else {
    sql =
      "SELECT archive_url FROM product_versions WHERE product_id = ? ORDER BY created_at DESC LIMIT 1";
    params = [productId];
  }

  const versions = await query<(RowDataPacket & { archive_url: string })[]>(
    sql,
    params,
  );

  return versions[0]?.archive_url ?? null;
}
