import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "NOT_AVAILABLE_IN_PRODUCTION" }, { status: 403 });
  }

  const key = process.env.CX_ADMIN_KEY ?? "";
  if (!key) {
    return NextResponse.json({ ok: false, error: "CX_ADMIN_KEY is not set" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, key });
}
