import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { deleteSession } from "@/services/auth.service";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    cookieStore.delete("session_id");
  } catch (error) {
    console.error("Logout error:", error);
  }

  return NextResponse.redirect(appUrl);
}
