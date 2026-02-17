import type { ApiResponse } from "@/types/api";

import { NextResponse } from "next/server";

import { ApiError } from "./api-error";

export function apiSuccess<T>(
  data: T,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, statusCode: error.statusCode },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    { success: false, error: "Internal server error", statusCode: 500 },
    { status: 500 },
  );
}
