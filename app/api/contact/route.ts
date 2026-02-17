import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { getSession } from "@/lib/auth";
import { submitContact } from "@/services/contact.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    if (!body.email || !body.name || !body.subject || !body.message) {
      throw ApiError.badRequest("All fields are required");
    }

    const contact = await submitContact({
      user_id: session?.user.id,
      email: body.email,
      name: body.name,
      category: body.category ?? "general",
      subject: body.subject,
      message: body.message,
    });

    return apiSuccess(contact, 201);
  } catch (error) {
    return apiError(error);
  }
}
