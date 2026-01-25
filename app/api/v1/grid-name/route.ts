import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function normalizeName(raw: unknown) {
  const s = String(raw ?? "").trim();
  if (s.length > 32) return null;
  return s; // ""もOK（命名解除）
}

export async function PATCH(req: NextRequest) {
  try {
    requireDbConfigured();

    const uid = req.cookies.get("cx_uid")?.value ?? "";
    if (!uid) return noStore(NextResponse.json({ ok: false, error: "NOT_JOINED" }, { status: 401 }));

    const body = await req.json().catch(() => ({}));
    const gridId = String(body.gridId ?? "").trim();
    if (!gridId) return noStore(NextResponse.json({ ok: false, error: "INVALID_GRID" }, { status: 400 }));

    const name = normalizeName(body.name);
    if (name === null) return noStore(NextResponse.json({ ok: false, error: "INVALID_NAME" }, { status: 400 }));

    const r = await sql`
      UPDATE grids
      SET name = ${name}
      WHERE id = ${gridId} AND owner_id = ${uid}
      RETURNING id, name
    `;

    if (r.rows.length === 0) {
      return noStore(NextResponse.json({ ok: false, error: "NOT_OWNER" }, { status: 403 }));
    }

    return noStore(NextResponse.json({ ok: true, grid: r.rows[0] }));
  } catch (e: any) {
    return noStore(NextResponse.json({ ok: false, error: e?.message ?? "RENAME_FAILED" }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) { return PATCH(req); }
export async function PUT(req: NextRequest) { return PATCH(req); }