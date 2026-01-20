import { NextResponse } from "next/server";

export const runtime = "nodejs";

// MVP phase: no persistent storage.
// This endpoint exists only to show where "official updates" would be published later.
export async function GET() {
  return NextResponse.json({ events: [] });
}
