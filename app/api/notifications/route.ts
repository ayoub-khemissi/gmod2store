import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "@/services/notification.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const data = await getUserNotifications(session.user.id);

    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    if (body.markAllRead) {
      await markAllAsRead(session.user.id);
    } else if (body.notificationId) {
      await markAsRead(body.notificationId, session.user.id);
    }

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
