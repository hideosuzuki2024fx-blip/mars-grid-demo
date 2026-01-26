"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Grid = {
  id: string;
  r: number;
  c: number;
  name: string | null;
  locked: boolean;
};

export default function MePage() {
  const sp = useSearchParams();
  const focusId = useMemo(() => sp.get("grid") || sp.get("focus"), [sp]);

  const [user, setUser] = useState<any>(null);
  const [grids, setGrids] = useState<Grid[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const r = await fetch("/api/v1/me");
    const j = await r.json();
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

  useEffect(() => {
    if (!focusId) return;
    setFocused(focusId);
  }, [focusId]);

  // グリッド読み込み後にスクロール
  useEffect(() => {
    if (!focused) return;
    const el = document.getElementById(`grid-card-${focused}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused, grids.length]);

  async function saveName(gridId: string) {
    setSaving(gridId);
    try {
      const r = await fetch(`/api/v1/grids/${gridId}/name`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: draft[gridId] ?? "" }),
      });
      const j = await r.json();
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
        {grids.map((g) => {
          const isFocus = focused === g.id;
          return (
            <div
              key={g.id}
              id={`grid-card-${g.id}`}
              style={{
                border: isFocus ? "2px solid #4aa3ff" : "1px solid #333",
                borderRadius: 12,
                padding: 12,
                boxShadow: isFocus ? "0 0 0 3px rgba(74,163,255,0.2)" : "none",
                background: isFocus ? "rgba(74,163,255,0.06)" : "transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{g.id}</div>
                  <div style={{ opacity: 0.85 }}>locked: {g.locked ? "YES" : "NO"}</div>
                </div>
                <a href={`/v1/market?grid=${encodeURIComponent(g.id)}`}>→ Market</a>
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
          );
        })}
      </div>

      {user && grids.length === 0 && (
        <div style={{ marginTop: 14, opacity: 0.85 }}>
          まだ区画がありません。<b>Admin → Allocate</b> を実行すると配布されます。
        </div>
      )}
    </div>
  );
}
