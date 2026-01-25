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

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/grids");
        const j = await r.json();
        if (!j.ok) throw new Error(j.error ?? "GRIDS_FAILED");
        setGrids(j.grids);
      } catch (e: any) {
        setErr(e?.message ?? "GRIDS_FAILED");
      }
    })();
  }, []);

  const dims = useMemo(() => {
    let maxR = 0, maxC = 0;
    for (const g of grids) {
      if (g.r > maxR) maxR = g.r;
      if (g.c > maxC) maxC = g.c;
    }
    return { rows: maxR + 1, cols: maxC + 1 };
  }, [grids]);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Map</h2>

      {err && <div style={{ color: "#ff6b6b" }}>Error: {err}</div>}

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
            const bg = owned ? "#1f8b4c" : "#222";
            const bd = g.locked ? "2px solid #f7d94c" : "1px solid #444";
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
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Selected
          </h3>
          {!sel ? (
            <div style={{ opacity: 0.8 }}>セルをクリックしてください。</div>
          ) : (
            <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
              <div><b>ID</b>: {sel.id}</div>
              <div><b>Owner</b>: {sel.owner_handle ?? "-"}</div>
              <div><b>Name</b>: {sel.name ?? "-"}</div>
              <div><b>Locked</b>: {sel.locked ? "YES" : "NO"}</div>
              <div style={{ marginTop: 10 }}>
                <a href="/v1/me">→ 命名は My Grids から</a>
              </div>
              <div style={{ marginTop: 6 }}>
                <a href="/v1/market">→ 売買は Market から</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
