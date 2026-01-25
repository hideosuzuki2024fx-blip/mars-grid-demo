import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    requireDbConfigured();

    const uid = req.cookies.get("cx_uid")?.value ?? "";
    if (!uid) {
      return NextResponse.json({ ok: false, error: "NOT_JOINED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const gridId = String(body.gridId ?? "").trim();
    const price = Number(body.price ?? 0);

    if (!gridId || !Number.isFinite(price) || price <= 0 || price > 1000000) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const listingId = crypto.randomUUID();

    // 原子的に「自分の区画で、ロックされてない」場合だけロック＋出品作成
    const r = await sql`
      WITH g AS (
        UPDATE grids
        SET locked = true, updated_at = now()
        WHERE id = ${gridId} AND owner_id = ${uid} AND locked = false
        RETURNING id
      )
      INSERT INTO listings (id, grid_id, seller_id, price, status)
      SELECT ${listingId}, ${gridId}, ${uid}, ${price}, 'ACTIVE'
      WHERE EXISTS (SELECT 1 FROM g)
      RETURNING id, grid_id, price
    `;

    if (r.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "CANNOT_LIST" }, { status: 409 });
    }

    return NextResponse.json({ ok: true, listing: r.rows[0] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "LIST_FAILED" },
      { status: 500 }
    );
  }
}
