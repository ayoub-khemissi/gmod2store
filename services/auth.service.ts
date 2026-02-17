import type { User, Session, UserRole } from "@/types/user";

import crypto from "crypto";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface UserRow extends RowDataPacket, User {}

interface SessionWithUserRow extends RowDataPacket {
  session_id: string;
  user_id: number;
  expires_at: Date;
  session_created_at: Date;
  steam_id: string;
  username: string;
  avatar_url: string;
  role: string;
  bio: string | null;
  banner_url: string | null;
  slug: string | null;
  social_links: Record<string, string> | null;
  created_at: Date;
  updated_at: Date;
}

export async function findUserBySteamId(steamId: string): Promise<User | null> {
  const rows = await query<UserRow[]>(
    "SELECT * FROM users WHERE steam_id = ? LIMIT 1",
    [steamId],
  );

  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const rows = await query<UserRow[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] ?? null;
}

export async function createUser(data: {
  steam_id: string;
  username: string;
  avatar_url: string;
}): Promise<User> {
  const result = await execute(
    "INSERT INTO users (steam_id, username, avatar_url) VALUES (?, ?, ?)",
    [data.steam_id, data.username, data.avatar_url],
  );

  return (await findUserById(result.insertId))!;
}

export async function updateUser(
  id: number,
  data: Partial<
    Pick<
      User,
      | "username"
      | "avatar_url"
      | "bio"
      | "banner_url"
      | "slug"
      | "social_links"
      | "role"
    >
  >,
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
  values.push(id);

  await execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const ttlMs = Number(process.env.SESSION_TTL ?? 604800) * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  await execute(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    [sessionId, userId, expiresAt],
  );

  return sessionId;
}

export async function getSessionWithUser(
  sessionId: string,
): Promise<(Session & { user: User }) | null> {
  const rows = await query<SessionWithUserRow[]>(
    `SELECT
      s.id AS session_id, s.user_id, s.expires_at, s.created_at AS session_created_at,
      u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > NOW()
    LIMIT 1`,
    [sessionId],
  );

  if (!rows[0]) return null;

  const row = rows[0];

  return {
    id: row.session_id,
    user_id: row.user_id,
    expires_at: row.expires_at,
    created_at: row.session_created_at,
    user: {
      id: row.user_id,
      steam_id: row.steam_id,
      username: row.username,
      avatar_url: row.avatar_url,
      role: row.role as UserRole,
      bio: row.bio,
      banner_url: row.banner_url,
      slug: row.slug,
      social_links: row.social_links,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
}

export async function deleteExpiredSessions(): Promise<void> {
  await execute("DELETE FROM sessions WHERE expires_at < NOW()");
}
