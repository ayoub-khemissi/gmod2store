import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/auth";
import {
  getTicketWithMessages,
  updateTicketStatus,
} from "@/services/ticket.service";

export async function POST(
  _request: NextRequest,
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

    await updateTicketStatus(Number(id), "resolved");

    return apiSuccess({ resolved: true });
  } catch (error) {
    return apiError(error);
  }
}
