import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    requireDbConfigured();

    const buyerId = req.cookies.get("cx_uid")?.value ?? "";
    if (!buyerId) {
      return NextResponse.json({ ok: false, error: "NOT_JOINED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const listingId = String(body.listingId ?? "").trim();
    if (!listingId) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    // 1ステートメントで原子的に決済＆所有権移転（簡易デモとしての最低ライン）
    const t = await sql`
      WITH listing AS (
        SELECT id, grid_id, seller_id, price
        FROM listings
        WHERE id = ${listingId} AND status = 'ACTIVE'
        FOR UPDATE
      ),
      can_pay AS (
        SELECT 1
        FROM users b, listing l
        WHERE b.id = ${buyerId} AND b.balance >= l.price
      ),
      sold AS (
        UPDATE listings
        SET status = 'SOLD'
        WHERE id = (SELECT id FROM listing)
          AND EXISTS (SELECT 1 FROM can_pay)
        RETURNING id, grid_id, seller_id, price
      ),
      transfer AS (
        UPDATE grids
        SET owner_id = ${buyerId}, locked = false, updated_at = now()
        WHERE id = (SELECT grid_id FROM sold)
          AND owner_id = (SELECT seller_id FROM sold)
        RETURNING id
      ),
      pay_buyer AS (
        UPDATE users
        SET balance = balance - (SELECT price FROM sold)
        WHERE id = ${buyerId}
          AND EXISTS (SELECT 1 FROM transfer)
        RETURNING id
      ),
      pay_seller AS (
        UPDATE users
        SET balance = balance + (SELECT price FROM sold)
        WHERE id = (SELECT seller_id FROM sold)
          AND EXISTS (SELECT 1 FROM transfer)
        RETURNING id
      ),
      ledger AS (
        INSERT INTO trades (id, grid_id, seller_id, buyer_id, price)
        SELECT gen_random_uuid()::text, (SELECT grid_id FROM sold),
               (SELECT seller_id FROM sold), ${buyerId}, (SELECT price FROM sold)
        WHERE EXISTS (SELECT 1 FROM transfer)
        RETURNING id
      )
      SELECT
        (SELECT COUNT(*) FROM sold) AS sold_count,
        (SELECT COUNT(*) FROM transfer) AS transfer_count
    `;

    const soldCount = Number(t.rows?.[0]?.sold_count ?? 0);
    const transferCount = Number(t.rows?.[0]?.transfer_count ?? 0);

    if (soldCount === 0 || transferCount === 0) {
      return NextResponse.json({ ok: false, error: "BUY_FAILED_OR_INSUFFICIENT" }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // gen_random_uuid は pgcrypto が必要 → admin init で有効化
    return NextResponse.json(
      { ok: false, error: e?.message ?? "BUY_FAILED" },
      { status: 500 }
    );
  }
}
