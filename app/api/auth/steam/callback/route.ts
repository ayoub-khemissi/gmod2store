import { NextRequest, NextResponse } from "next/server";

import { verifySteamLogin, getSteamProfile } from "@/lib/steam";
import {
  findUserBySteamId,
  createUser,
  updateUser,
  createSession,
} from "@/services/auth.service";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const params = request.nextUrl.searchParams;
    const steamId = await verifySteamLogin(params);

    if (!steamId) {
      return NextResponse.redirect(`${appUrl}/login?error=steam_verification_failed`);
    }

    const profile = await getSteamProfile(steamId);

    if (!profile) {
      return NextResponse.redirect(`${appUrl}/login?error=steam_profile_failed`);
    }

    let user = await findUserBySteamId(steamId);

    if (user) {
      await updateUser(user.id, {
        username: profile.personaname,
        avatar_url: profile.avatarfull,
      });
    } else {
      user = await createUser({
        steam_id: steamId,
        username: profile.personaname,
        avatar_url: profile.avatarfull,
      });
    }

    const sessionId = await createSession(user.id);
    const ttlMs = Number(process.env.SESSION_TTL ?? 604800) * 1000;

    const response = NextResponse.redirect(appUrl);

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ttlMs / 1000,
    });

    return response;
  } catch (error) {
    console.error("Steam callback error:", error);

    return NextResponse.redirect(`${appUrl}/login?error=unknown`);
  }
}
