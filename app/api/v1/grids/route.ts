import { NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    requireDbConfigured();

    const r = await sql`
      SELECT g.id, g.r, g.c, g.name, g.locked,
             u.handle AS owner_handle
      FROM grids g
      LEFT JOIN users u ON u.id = g.owner_id
      ORDER BY g.r, g.c
    `;
    return NextResponse.json({ ok: true, grids: r.rows });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "GRIDS_FAILED" },
      { status: 500 }
    );
  }
}
