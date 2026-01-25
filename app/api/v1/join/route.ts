import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

function normalizeHandle(raw: unknown) {
  const s = String(raw ?? "").trim();
  if (s.length < 1 || s.length > 24) return null;
  // 簡易制限（安全のため）
  if (!/^[a-zA-Z0-9_\-ぁ-んァ-ヶ一-龠]+$/.test(s)) return null;
  return s;
}

export async function POST(req: NextRequest) {
  try {
    requireDbConfigured();

    const body = await req.json().catch(() => ({}));
    const handle = normalizeHandle(body.handle);
    if (!handle) {
      return NextResponse.json(
        { ok: false, error: "INVALID_HANDLE" },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();

    const r = await sql`
      INSERT INTO users (id, handle)
      VALUES (${newId}, ${handle})
      ON CONFLICT (handle)
      DO UPDATE SET handle = EXCLUDED.handle
      RETURNING id, handle, balance
    `;

    const user = r.rows[0];

    const res = NextResponse.json({ ok: true, user });
    res.cookies.set({
      name: "cx_uid",
      value: user.id,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "JOIN_FAILED" },
      { status: 500 }
    );
  }
}
