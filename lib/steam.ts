const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_API_URL = "https://api.steampowered.com";

export function getSteamLoginUrl(returnUrl: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl,
    "openid.realm": new URL(returnUrl).origin,
    "openid.identity":
      "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id":
      "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

export async function verifySteamLogin(
  params: URLSearchParams,
): Promise<string | null> {
  const verifyParams = new URLSearchParams(params);

  verifyParams.set("openid.mode", "check_authentication");

  const response = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
  });

  const text = await response.text();

  if (!text.includes("is_valid:true")) return null;

  const claimedId = params.get("openid.claimed_id");

  if (!claimedId) return null;

  const match = claimedId.match(
    /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/,
  );

  return match?.[1] ?? null;
}

export interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

export async function getSteamProfile(
  steamId: string,
): Promise<SteamProfile | null> {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) return null;

  const url = `${STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
  const response = await fetch(url);
  const data = await response.json();
  const player = data?.response?.players?.[0];

  if (!player) return null;

  return {
    steamid: player.steamid,
    personaname: player.personaname,
    avatarfull: player.avatarfull,
    profileurl: player.profileurl,
  };
}
