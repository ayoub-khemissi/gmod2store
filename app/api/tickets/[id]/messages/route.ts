import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import { getTicketWithMessages, addMessage } from "@/services/ticket.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const data = await getTicketWithMessages(Number(id));

    if (!data) throw ApiError.notFound("Ticket not found");
    if (
      data.ticket.requester_id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      throw ApiError.forbidden();
    }

    const body = await request.json();

    if (!body.content?.trim()) {
      throw ApiError.badRequest("Message content is required");
    }

    await addMessage(Number(id), session.user.id, body.content.trim());

    return apiSuccess({ sent: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}
