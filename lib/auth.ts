import type { User, UserRole, Session } from "@/types/user";

import { cookies } from "next/headers";

import { getSessionWithUser } from "@/services/auth.service";
import { ApiError } from "@/lib/api-error";

const SESSION_COOKIE = "session_id";

export async function getSession(): Promise<(Session & { user: User }) | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  return getSessionWithUser(sessionId);
}

export async function requireAuth(): Promise<Session & { user: User }> {
  const session = await getSession();

  if (!session) {
    throw ApiError.unauthorized("You must be logged in");
  }

  return session;
}

export async function requireNotBanned(): Promise<Session & { user: User }> {
  const session = await requireAuth();

  if (session.user.is_banned) {
    throw ApiError.forbidden("Your account is banned from submitting");
  }

  return session;
}

export async function requireRole(
  roles: UserRole[],
): Promise<Session & { user: User }> {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    throw ApiError.forbidden("You do not have permission to access this");
  }

  return session;
}
