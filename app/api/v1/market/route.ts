import { NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    requireDbConfigured();

    const r = await sql`
      SELECT l.id, l.grid_id, l.price,
             u.handle AS seller_handle,
             l.created_at
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'ACTIVE'
      ORDER BY l.created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ ok: true, listings: r.rows });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "MARKET_FAILED" },
      { status: 500 }
    );
  }
}
