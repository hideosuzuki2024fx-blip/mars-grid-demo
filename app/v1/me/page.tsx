"use client";

import { useEffect, useState } from "react";

type Grid = {
  id: string;
  r: number;
  c: number;
  name: string | null;
  locked: boolean;
};

async function readJson(r: Response) {
  const ct = r.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(`APIがJSONを返していません (HTTP ${r.status})`);
  }
  const j = await r.json();
  return { j, status: r.status };
}

export default function MePage() {
  const [user, setUser] = useState<any>(null);
  const [grids, setGrids] = useState<Grid[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  async function load() {
    setErr(null);
    const r = await fetch("/api/v1/me", { cache: "no-store" });
    const { j } = await readJson(r);
    if (!j.ok) throw new Error(j.error ?? "ME_FAILED");

    setUser(j.user);
    setGrids(j.grids);

    const d: Record<string, string> = {};
    for (const g of j.grids) d[g.id] = g.name ?? "";
    setDraft(d);
  }

  useEffect(() => {
    load().catch((e: any) => setErr(e?.message ?? "ME_FAILED"));
  }, []);

  async function saveName(gridId: string) {
    setSaving(gridId);
    setErr(null);
    try {
      const r = await fetch("/api/v1/grid-name", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gridId, name: draft[gridId] ?? "" }),
        cache: "no-store",
      });
      const { j } = await readJson(r);
      if (!j.ok) throw new Error(j.error ?? "RENAME_FAILED");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "RENAME_FAILED");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>My Grids</h2>

      {err && <div style={{ color: "#ff6b6b", marginBottom: 10 }}>Error: {err}</div>}

      {!user ? (
        <div style={{ opacity: 0.8 }}>
          未参加なら <a href="/v1/join">Join</a> してください。
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          <div><b>Handle</b>: {user.handle}</div>
          <div><b>Balance</b>: {user.balance} CX</div>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {grids.map((g) => (
          <div key={g.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{g.id}</div>
                <div style={{ opacity: 0.85 }}>locked: {g.locked ? "YES" : "NO"}</div>
              </div>
              <a href="/v1/market">→ Market</a>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input
                value={draft[g.id] ?? ""}
                onChange={(e) => setDraft((x) => ({ ...x, [g.id]: e.target.value }))}
                placeholder="命名（32文字まで）"
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #333",
                }}
              />
              <button
                onClick={() => saveName(g.id)}
                disabled={saving === g.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #333",
                  cursor: "pointer",
                }}
              >
                {saving === g.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {user && grids.length === 0 && (
        <div style={{ marginTop: 14, opacity: 0.85 }}>
          まだ区画がありません。<b>Admin → Allocate</b> を実行すると配布されます。
        </div>
      )}
    </div>
  );
}