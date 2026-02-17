import type { ApiKey } from "@/types/api-key";

import crypto from "crypto";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface ApiKeyRow extends RowDataPacket, ApiKey {}

export async function createApiKey(
  userId: number,
  name: string,
): Promise<{ apiKey: ApiKey; fullKey: string }> {
  const rawKey = `gms_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  const result = await execute(
    "INSERT INTO api_keys (user_id, name, key_hash, key_prefix) VALUES (?, ?, ?, ?)",
    [userId, name, keyHash, keyPrefix],
  );

  const rows = await query<ApiKeyRow[]>("SELECT * FROM api_keys WHERE id = ?", [
    result.insertId,
  ]);

  return { apiKey: rows[0]!, fullKey: rawKey };
}

export async function verifyApiKey(key: string): Promise<ApiKey | null> {
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const rows = await query<ApiKeyRow[]>(
    "SELECT * FROM api_keys WHERE key_hash = ? AND is_active = TRUE",
    [keyHash],
  );

  return rows[0] ?? null;
}

export async function listApiKeys(userId: number): Promise<ApiKey[]> {
  return query<ApiKeyRow[]>(
    "SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
}

export async function revokeApiKey(
  keyId: number,
  userId: number,
): Promise<void> {
  await execute(
    "UPDATE api_keys SET is_active = FALSE WHERE id = ? AND user_id = ?",
    [keyId, userId],
  );
}
