import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const GRID_ROWS = 12;
const GRID_COLS = 24;

function gridId(r: number, c: number) {
  const rr = String(r).padStart(2, "0");
  const cc = String(c).padStart(2, "0");
  return `G-${rr}-${cc}`;
}

export async function POST(req: NextRequest) {
  try {
    requireDbConfigured();
    assertAdmin(req);

    // pgcrypto (gen_random_uuid) を使うための拡張
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        handle TEXT NOT NULL UNIQUE,
        balance INT NOT NULL DEFAULT 1000,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS grids (
        id TEXT PRIMARY KEY,
        r INT NOT NULL,
        c INT NOT NULL,
        owner_id TEXT NULL REFERENCES users(id),
        name TEXT NULL,
        locked BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_grids_owner ON grids(owner_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        grid_id TEXT NOT NULL REFERENCES grids(id),
        seller_id TEXT NOT NULL REFERENCES users(id),
        price INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)`;

    await sql`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        grid_id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        buyer_id TEXT NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // grids が空なら生成
    const count = await sql`SELECT COUNT(*)::int AS n FROM grids`;
    const n = Number(count.rows?.[0]?.n ?? 0);

    if (n === 0) {
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const id = gridId(r, c);
          await sql`INSERT INTO grids (id, r, c) VALUES (${id}, ${r}, ${c})`;
        }
      }
    }

    return NextResponse.json({ ok: true, rows: GRID_ROWS, cols: GRID_COLS });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "INIT_FAILED" },
      { status: 500 }
    );
  }
}
