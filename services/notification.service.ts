import type { Notification } from "@/types/notification";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface NotificationRow extends RowDataPacket, Notification {}
interface CountRow extends RowDataPacket {
  total: number;
}

export async function createNotification(data: {
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  await execute(
    "INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)",
    [data.user_id, data.type, data.title, data.message, data.link ?? null],
  );
}

export async function getUserNotifications(
  userId: number,
  limit = 20,
): Promise<{ notifications: Notification[]; unread: number }> {
  const [notifications, countRows] = await Promise.all([
    query<NotificationRow[]>(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      [userId, limit],
    ),
    query<CountRow[]>(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId],
    ),
  ]);

  return { notifications, unread: countRows[0]?.total ?? 0 };
}

export async function markAsRead(
  notificationId: number,
  userId: number,
): Promise<void> {
  await execute(
    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
    [notificationId, userId],
  );
}

export async function markAllAsRead(userId: number): Promise<void> {
  await execute(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
    [userId],
  );
}

export async function notifyBuyersOfUpdate(
  productId: number,
  productTitle: string,
  version: string,
): Promise<void> {
  // Get all active license holders for this product
  const rows = await query<(RowDataPacket & { user_id: number })[]>(
    "SELECT DISTINCT user_id FROM licenses WHERE product_id = ? AND is_active = TRUE",
    [productId],
  );

  for (const row of rows) {
    await createNotification({
      user_id: row.user_id,
      type: "product_update",
      title: `${productTitle} updated`,
      message: `Version ${version} is now available.`,
      link: `/library`,
    });
  }
}
