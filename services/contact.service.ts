import type { Contact } from "@/types/contact";

import { RowDataPacket } from "mysql2/promise";

import { query, execute } from "@/lib/db";

interface ContactRow extends RowDataPacket, Contact {}

export async function submitContact(data: {
  user_id?: number;
  email: string;
  name: string;
  category: string;
  subject: string;
  message: string;
}): Promise<Contact> {
  const result = await execute(
    "INSERT INTO contacts (user_id, email, name, category, subject, message) VALUES (?, ?, ?, ?, ?, ?)",
    [
      data.user_id ?? null,
      data.email,
      data.name,
      data.category,
      data.subject,
      data.message,
    ],
  );

  const rows = await query<ContactRow[]>(
    "SELECT * FROM contacts WHERE id = ?",
    [result.insertId],
  );

  return rows[0]!;
}

export async function getContacts(resolved?: boolean): Promise<Contact[]> {
  if (resolved !== undefined) {
    return query<ContactRow[]>(
      "SELECT * FROM contacts WHERE is_resolved = ? ORDER BY created_at DESC",
      [resolved],
    );
  }

  return query<ContactRow[]>("SELECT * FROM contacts ORDER BY created_at DESC");
}

export async function resolveContact(contactId: number): Promise<void> {
  await execute("UPDATE contacts SET is_resolved = TRUE WHERE id = ?", [
    contactId,
  ]);
}
