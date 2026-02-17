import { NextRequest } from "next/server";

import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { findUserById } from "@/services/auth.service";
import { updateCreatorProfile } from "@/services/creator.service";

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await findUserById(session.user.id);

    return apiSuccess(user);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    await updateCreatorProfile(session.user.id, {
      bio: body.bio,
      banner_url: body.banner_url,
      slug: body.slug,
      social_links: body.social_links,
    });

    const user = await findUserById(session.user.id);

    return apiSuccess(user);
  } catch (error) {
    return apiError(error);
  }
}
