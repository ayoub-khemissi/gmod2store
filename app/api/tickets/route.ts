import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getTickets, createTicket } from "@/services/ticket.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const tickets = await getTickets(session.user.id);

    return apiSuccess(tickets);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const ticket = await createTicket({
      requester_id: session.user.id,
      product_id: body.product_id,
      subject: body.subject,
      category: body.category ?? "general",
      message: body.message,
    });

    return apiSuccess(ticket, 201);
  } catch (error) {
    return apiError(error);
  }
}
