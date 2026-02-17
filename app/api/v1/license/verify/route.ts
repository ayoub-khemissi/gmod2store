import { NextRequest, NextResponse } from "next/server";

import { verifyApiKey } from "@/services/api-key.service";
import { verifyLicense } from "@/services/license.service";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { valid: false, error: "Missing API key" },
      { status: 401 },
    );
  }

  const apiKeyStr = authHeader.slice(7);
  const apiKey = await verifyApiKey(apiKeyStr);

  if (!apiKey) {
    return NextResponse.json(
      { valid: false, error: "Invalid API key" },
      { status: 401 },
    );
  }

  const licenseKey = request.nextUrl.searchParams.get("license_key");
  const steamId = request.nextUrl.searchParams.get("steam_id") ?? undefined;

  if (!licenseKey) {
    return NextResponse.json(
      { valid: false, error: "license_key is required" },
      { status: 400 },
    );
  }

  const result = await verifyLicense(licenseKey, steamId);

  return NextResponse.json({
    valid: result.valid,
    license: result.license
      ? {
          product_id: result.license.product_id,
          is_active: result.license.is_active,
          created_at: result.license.created_at,
        }
      : null,
  });
}
