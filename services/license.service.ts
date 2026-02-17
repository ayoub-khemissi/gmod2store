import crypto from "crypto";
import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";
import type { License } from "@/types/license";

interface LicenseRow extends RowDataPacket, License {}
interface CountRow extends RowDataPacket {
  total: number;
}

function generateLicenseKey(): string {
  const segments: string[] = [];

  for (let i = 0; i < 4; i++) {
    segments.push(
      crypto
        .randomBytes(2)
        .toString("hex")
        .toUpperCase(),
    );
  }

  return segments.join("-");
}

export async function createLicense(
  productId: number,
  userId: number,
): Promise<License> {
  let key: string;
  let attempts = 0;

  // Generate unique key
  do {
    key = generateLicenseKey();
    const existing = await query<CountRow[]>(
      "SELECT COUNT(*) as total FROM licenses WHERE license_key = ?",
      [key],
    );

    if (existing[0]?.total === 0) break;
    attempts++;
  } while (attempts < 10);

  const result = await execute(
    "INSERT INTO licenses (product_id, user_id, license_key) VALUES (?, ?, ?)",
    [productId, userId, key],
  );

  const rows = await query<LicenseRow[]>(
    "SELECT * FROM licenses WHERE id = ?",
    [result.insertId],
  );

  return rows[0]!;
}

export async function verifyLicense(
  licenseKey: string,
  steamId?: string,
): Promise<{
  valid: boolean;
  license?: License;
}> {
  let sql = `
    SELECT l.* FROM licenses l
    WHERE l.license_key = ? AND l.is_active = TRUE
  `;
  const params: unknown[] = [licenseKey];

  if (steamId) {
    sql += " AND l.user_id = (SELECT id FROM users WHERE steam_id = ? LIMIT 1)";
    params.push(steamId);
  }

  const rows = await query<LicenseRow[]>(sql, params);

  if (!rows[0]) return { valid: false };

  return { valid: true, license: rows[0] };
}

export async function revokeLicense(licenseId: number): Promise<void> {
  await execute(
    "UPDATE licenses SET is_active = FALSE, revoked_at = NOW() WHERE id = ?",
    [licenseId],
  );
}

export async function getUserLicenses(userId: number): Promise<License[]> {
  return query<LicenseRow[]>(
    "SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
}
