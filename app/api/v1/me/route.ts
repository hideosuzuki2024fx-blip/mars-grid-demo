import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    requireDbConfigured();

    const uid = req.cookies.get("cx_uid")?.value ?? "";
    if (!uid) {
      return NextResponse.json({ ok: false, error: "NOT_JOINED" }, { status: 401 });
    }

    const u = await sql`SELECT id, handle, balance FROM users WHERE id = ${uid}`;
    if (u.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 401 });
    }

    const grids = await sql`
      SELECT id, r, c, q, hex_r, name, locked
      FROM grids
      WHERE owner_id = ${uid}
      ORDER BY r, c
    `;

    return NextResponse.json({ ok: true, user: u.rows[0], grids: grids.rows });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "ME_FAILED" },
      { status: 500 }
    );
  }
}
