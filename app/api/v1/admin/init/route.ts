import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";
import { buildOpportunityDemo } from "@/lib/opportunityDemo";

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

    // uuid用（BUYで使用）
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

    // --- tables (create if missing) ---
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
        locked BOOLEAN NOT NULL DEFAULT false
      )
    `;

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

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        sol INT NOT NULL,
        title TEXT NOT NULL,
        kind TEXT NOT NULL,
        detail TEXT NULL,
        cell_id TEXT NOT NULL,
        x_km DOUBLE PRECISION NOT NULL,
        y_km DOUBLE PRECISION NOT NULL,
        km_from_origin DOUBLE PRECISION NOT NULL
      )
    `;

    // --- migrations (add missing columns safely) ---
    await sql`ALTER TABLE grids ADD COLUMN IF NOT EXISTS name TEXT NULL`;
    await sql`ALTER TABLE grids ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE grids ADD COLUMN IF NOT EXISTS owner_id TEXT NULL`;
    await sql`ALTER TABLE grids ADD COLUMN IF NOT EXISTS q INT`;
    await sql`ALTER TABLE grids ADD COLUMN IF NOT EXISTS hex_r INT`;

    // index
    await sql`CREATE INDEX IF NOT EXISTS idx_grids_owner ON grids(owner_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_grids_hex ON grids(q, hex_r)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_cell ON events(cell_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_sol ON events(sol)`;

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

    const qOffset = Math.floor(GRID_COLS / 2);
    const rOffset = Math.floor(GRID_ROWS / 2);
    await sql`
      UPDATE grids
      SET q = c - ${qOffset}, hex_r = r - ${rOffset}
      WHERE q IS NULL OR hex_r IS NULL
    `;

    const demo = buildOpportunityDemo();
    for (const event of demo.events) {
      await sql`
        INSERT INTO events (id, sol, title, kind, detail, cell_id, x_km, y_km, km_from_origin)
        VALUES (
          ${event.id},
          ${event.sol},
          ${event.title},
          ${event.kind},
          ${event.detail ?? null},
          ${event.cellId},
          ${event.xKm},
          ${event.yKm},
          ${event.kmFromOrigin}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }

    return NextResponse.json({ ok: true, rows: GRID_ROWS, cols: GRID_COLS });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "INIT_FAILED" },
      { status: 500 }
    );
  }
}
