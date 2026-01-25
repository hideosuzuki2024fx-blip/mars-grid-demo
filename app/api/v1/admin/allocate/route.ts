import { NextRequest, NextResponse } from "next/server";
import { sql, requireDbConfigured } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";
import { shuffleWithSeed } from "@/lib/seeded";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    requireDbConfigured();
    assertAdmin(req);

    const body = await req.json().catch(() => ({}));
    const perUser = Math.max(1, Math.min(10, Number(body.perUser ?? 3)));
    const seed = String(body.seed ?? "seed").trim() || "seed";

    // グリッドを持っていないユーザー
    const users = await sql`
      SELECT u.id, u.handle
      FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM grids g WHERE g.owner_id = u.id)
      ORDER BY u.created_at ASC
      LIMIT 200
    `;

    const free = await sql`
      SELECT id
      FROM grids
      WHERE owner_id IS NULL
      ORDER BY id
      LIMIT 5000
    `;

    const shuffled = shuffleWithSeed(free.rows.map((x: any) => x.id), seed);

    let cursor = 0;
    let assigned = 0;

    for (const u of users.rows) {
      for (let i = 0; i < perUser; i++) {
        const gid = shuffled[cursor++];
        if (!gid) break;
        const r = await sql`
          UPDATE grids
          SET owner_id = ${u.id}, locked = false, updated_at = now()
          WHERE id = ${gid} AND owner_id IS NULL
        `;
        assigned += r.rowCount ?? 0;
      }
    }

    return NextResponse.json({
      ok: true,
      perUser,
      seed,
      usersTargeted: users.rows.length,
      assigned,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "ALLOCATE_FAILED" },
      { status: 500 }
    );
  }
}
