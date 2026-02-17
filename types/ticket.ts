export type TicketStatus = "open" | "in_progress" | "resolved" | "escalated";
export type TicketCategory = "general" | "bug_report" | "partnership" | "other";

export interface Ticket {
  id: number;
  requester_id: number;
  product_id: number | null;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  content: string;
  created_at: Date;
}
