import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

const protectedRoutes = ["/library", "/creator", "/tickets", "/api-keys"];

// Simple in-memory rate limiter for /api/v1/ routes
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW });

    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;

  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for public API
  if (pathname.startsWith("/api/v1/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const allowed = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
  }

  // Auth guard for protected routes
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected) {
    const sessionId = request.cookies.get("session_id")?.value;

    if (!sessionId) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    const sessionId = request.cookies.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/library/:path*",
    "/creator/:path*",
    "/tickets/:path*",
    "/api-keys/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
