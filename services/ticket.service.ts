import type {
  Ticket,
  TicketMessage,
  TicketCategory,
  TicketStatus,
} from "@/types/ticket";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface TicketRow extends RowDataPacket, Ticket {}
interface MessageRow extends RowDataPacket, TicketMessage {
  username: string;
  avatar_url: string;
}

export async function createTicket(data: {
  requester_id: number;
  product_id?: number;
  subject: string;
  category: TicketCategory;
  message: string;
}): Promise<Ticket> {
  const result = await execute(
    "INSERT INTO tickets (requester_id, product_id, subject, category) VALUES (?, ?, ?, ?)",
    [data.requester_id, data.product_id ?? null, data.subject, data.category],
  );

  await execute(
    "INSERT INTO ticket_messages (ticket_id, sender_id, content) VALUES (?, ?, ?)",
    [result.insertId, data.requester_id, data.message],
  );

  const rows = await query<TicketRow[]>("SELECT * FROM tickets WHERE id = ?", [
    result.insertId,
  ]);

  return rows[0]!;
}

export async function getTickets(
  userId: number,
  status?: TicketStatus,
): Promise<Ticket[]> {
  if (status) {
    return query<TicketRow[]>(
      "SELECT * FROM tickets WHERE requester_id = ? AND status = ? ORDER BY updated_at DESC",
      [userId, status],
    );
  }

  return query<TicketRow[]>(
    "SELECT * FROM tickets WHERE requester_id = ? ORDER BY updated_at DESC",
    [userId],
  );
}

export async function getAllTickets(status?: TicketStatus): Promise<Ticket[]> {
  if (status) {
    return query<TicketRow[]>(
      "SELECT * FROM tickets WHERE status = ? ORDER BY updated_at DESC",
      [status],
    );
  }

  return query<TicketRow[]>("SELECT * FROM tickets ORDER BY updated_at DESC");
}

export async function getTicketWithMessages(
  ticketId: number,
): Promise<{ ticket: Ticket; messages: MessageRow[] } | null> {
  const tickets = await query<TicketRow[]>(
    "SELECT * FROM tickets WHERE id = ?",
    [ticketId],
  );

  if (!tickets[0]) return null;

  const messages = await query<MessageRow[]>(
    `SELECT tm.*, u.username, u.avatar_url
     FROM ticket_messages tm
     JOIN users u ON u.id = tm.sender_id
     WHERE tm.ticket_id = ?
     ORDER BY tm.created_at ASC`,
    [ticketId],
  );

  return { ticket: tickets[0], messages };
}

export async function addMessage(
  ticketId: number,
  senderId: number,
  content: string,
): Promise<void> {
  await execute(
    "INSERT INTO ticket_messages (ticket_id, sender_id, content) VALUES (?, ?, ?)",
    [ticketId, senderId, content],
  );

  await execute("UPDATE tickets SET updated_at = NOW() WHERE id = ?", [
    ticketId,
  ]);
}

export async function updateTicketStatus(
  ticketId: number,
  status: TicketStatus,
): Promise<void> {
  await execute("UPDATE tickets SET status = ? WHERE id = ?", [
    status,
    ticketId,
  ]);
}

export async function escalateTicket(ticketId: number): Promise<void> {
  await updateTicketStatus(ticketId, "escalated");
}
