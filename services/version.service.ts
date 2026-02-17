import type { ProductVersion } from "@/types/product";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface VersionRow extends RowDataPacket, ProductVersion {}

export async function createVersion(data: {
  product_id: number;
  version: string;
  changelog: string;
  archive_url: string;
  file_size: number;
}): Promise<ProductVersion> {
  const result = await execute(
    `INSERT INTO product_versions (product_id, version, changelog, archive_url, file_size)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.product_id,
      data.version,
      data.changelog,
      data.archive_url,
      data.file_size,
    ],
  );

  const rows = await query<VersionRow[]>(
    "SELECT * FROM product_versions WHERE id = ?",
    [result.insertId],
  );

  return rows[0]!;
}

export async function getLatestVersion(
  productId: number,
): Promise<ProductVersion | null> {
  const rows = await query<VersionRow[]>(
    "SELECT * FROM product_versions WHERE product_id = ? ORDER BY created_at DESC LIMIT 1",
    [productId],
  );

  return rows[0] ?? null;
}

export async function getNextVersion(productId: number): Promise<string> {
  const latest = await getLatestVersion(productId);

  if (!latest) return "1.0.0";

  const parts = latest.version.split(".").map(Number);

  parts[2] = (parts[2] ?? 0) + 1;

  return parts.join(".");
}
