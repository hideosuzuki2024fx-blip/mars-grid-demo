import { NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    requireDbConfigured();
    const r = await sql`
      SELECT
        id,
        sol,
        title,
        kind,
        detail,
        cell_id AS "cellId",
        x_km AS "xKm",
        y_km AS "yKm",
        km_from_origin AS "kmFromOrigin"
      FROM events
      ORDER BY sol ASC
    `;
    return NextResponse.json({ ok: true, events: r.rows });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "EVENTS_FAILED" },
      { status: 500 }
    );
  }
}
