"use client";

import { useEffect, useMemo, useState } from "react";

type Grid = {
  id: string;
  r: number;
  c: number;
  name: string | null;
  locked: boolean;
  owner_handle: string | null;
};

export default function MapPage() {
  const [grids, setGrids] = useState<Grid[]>([]);
  const [sel, setSel] = useState<Grid | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const r = await fetch("/api/v1/grids", { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "GRIDS_FAILED");
      setGrids(j.grids);
    } catch (e: any) {
      setErr(e?.message ?? "GRIDS_FAILED");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const dims = useMemo(() => {
    let maxR = 0, maxC = 0;
    for (const g of grids) {
      if (g.r > maxR) maxR = g.r;
      if (g.c > maxC) maxC = g.c;
    }
    return { rows: maxR + 1, cols: maxC + 1 };
  }, [grids]);

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied(null), 800);
    } catch {
      setErr("コピーに失敗しました（ブラウザ設定の可能性）");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Map</h2>
        <button
          onClick={load}
          style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
        >
          Reload
        </button>
      </div>

      {err && <div style={{ color: "#ff6b6b", marginBottom: 8 }}>Error: {err}</div>}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, dims.cols)}, 18px)`,
            gap: 2,
            border: "1px solid #333",
            padding: 8,
            borderRadius: 12,
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {grids.map((g) => {
            const owned = !!g.owner_handle;
            const isSel = sel?.id === g.id;

            const bg = owned ? "#1f8b4c" : "#222";

            // 優先順位：選択 > locked > 通常
            const bd = isSel
              ? "2px solid #4aa3ff"
              : g.locked
              ? "2px solid #f7d94c"
              : "1px solid #444";

            return (
              <button
                key={g.id}
                onClick={() => setSel(g)}
                title={`${g.id}\nOwner: ${g.owner_handle ?? "-"}\nName: ${g.name ?? "-"}`}
                style={{
                  width: 18,
                  height: 18,
                  background: bg,
                  border: bd,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              />
            );
          })}
        </div>

        <div style={{ minWidth: 320 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Selected</h3>

          {!sel ? (
            <div style={{ opacity: 0.8 }}>セルをクリックしてください。</div>
          ) : (
            <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
              <div><b>ID</b>: {sel.id}</div>
              <div><b>Owner</b>: {sel.owner_handle ?? "-"}</div>
              <div><b>Name</b>: {sel.name ?? "-"}</div>
              <div><b>Locked</b>: {sel.locked ? "YES" : "NO"}</div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={`/v1/me?grid=${encodeURIComponent(sel.id)}`}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #333",
                    textDecoration: "none",
                  }}
                >
                  → 命名へ
                </a>

                <a
                  href={`/v1/market?grid=${encodeURIComponent(sel.id)}`}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #333",
                    textDecoration: "none",
                  }}
                >
                  → Marketへ
                </a>

                <button
                  onClick={() => copyId(sel.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #333",
                    cursor: "pointer",
                  }}
                >
                  {copied === sel.id ? "Copied" : "IDコピー"}
                </button>
              </div>

              <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
                ※ 命名/出品は自動で対象グリッドが選択された状態で開きます（コピペ不要）
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}