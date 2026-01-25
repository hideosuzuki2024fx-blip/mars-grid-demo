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
  const [myHandle, setMyHandle] = useState<string | null>(null);

  // ズーム（1x / 1.5x / 2x）
  const [zoom, setZoom] = useState<1 | 1.5 | 2>(1);

  const BASE_CELL = 32;
  const CELL = Math.round(BASE_CELL * zoom);
  const GAP = Math.max(3, Math.round(4 * zoom));

  async function loadMe() {
    try {
      const r = await fetch("/api/v1/me", { cache: "no-store" });
      const j = await r.json();
      if (j.ok && j.user?.handle) setMyHandle(j.user.handle);
    } catch {
      // 未参加でもMapは見えるので無視
    }
  }

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
    loadMe();
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

  function isMine(g: Grid) {
    return !!g.owner_handle && !!myHandle && g.owner_handle === myHandle;
  }

  function colorFor(g: Grid) {
    const owned = !!g.owner_handle;
    if (isMine(g)) return "#3B82F6"; // 自分
    if (owned) return "#22C55E";     // 他人
    return "#111";                   // 未所有
  }

  function borderFor(g: Grid) {
    const isSel = sel?.id === g.id;

    // 優先順位：選択 > locked > 自分 > 通常
    if (isSel) return "3px solid #4AA3FF";
    if (g.locked) return "3px solid #F7D94C";
    if (isMine(g)) return "2px solid rgba(255,255,255,0.85)";
    return "1px solid #444";
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Map</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 8px", border: "1px solid #333", borderRadius: 10 }}>
            <span style={{ opacity: 0.85 }}>Zoom</span>
            <button
              onClick={() => setZoom(1)}
              style={{ padding: "4px 8px", borderRadius: 8, border: zoom === 1 ? "2px solid #4AA3FF" : "1px solid #333", cursor: "pointer" }}
            >
              1x
            </button>
            <button
              onClick={() => setZoom(1.5)}
              style={{ padding: "4px 8px", borderRadius: 8, border: zoom === 1.5 ? "2px solid #4AA3FF" : "1px solid #333", cursor: "pointer" }}
            >
              1.5x
            </button>
            <button
              onClick={() => setZoom(2)}
              style={{ padding: "4px 8px", borderRadius: 8, border: zoom === 2 ? "2px solid #4AA3FF" : "1px solid #333", cursor: "pointer" }}
            >
              2x
            </button>
          </div>

          <button
            onClick={load}
            style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </div>

      {err && <div style={{ color: "#ff6b6b", marginBottom: 8 }}>Error: {err}</div>}

      {/* 凡例 */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, opacity: 0.9, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, background: "#3B82F6", borderRadius: 4, border: "1px solid #333" }} />
          自分（★）
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, background: "#22C55E", borderRadius: 4, border: "1px solid #333" }} />
          他人
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, background: "#111", borderRadius: 4, border: "1px solid #333" }} />
          未所有
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 14, background: "#111", borderRadius: 4, border: "3px solid #F7D94C" }} />
          Locked
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, dims.cols)}, ${CELL}px)`,
            gap: GAP,
            border: "1px solid #333",
            padding: 10,
            borderRadius: 12,
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {grids.map((g) => {
            const bg = colorFor(g);
            const bd = borderFor(g);
            const selected = sel?.id === g.id;
            const mine = isMine(g);

            return (
              <div
                key={g.id}
                style={{
                  width: CELL,
                  height: CELL,
                  position: "relative",
                }}
                title={`${g.id}\nOwner: ${g.owner_handle ?? "-"}\nName: ${g.name ?? "-"}`}
              >
                <button
                  onClick={() => setSel(g)}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: bg,
                    border: bd,
                    borderRadius: 6,
                    cursor: "pointer",
                    transform: selected ? "scale(1.02)" : "none",
                  }}
                />
                {mine && (
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 3,
                      fontSize: Math.max(10, Math.round(12 * zoom)),
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.95)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.65)",
                      pointerEvents: "none",
                      userSelect: "none",
                      lineHeight: 1,
                    }}
                  >
                    ★
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ minWidth: 340 }}>
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
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", textDecoration: "none" }}
                >
                  → 命名へ
                </a>

                <a
                  href={`/v1/market?grid=${encodeURIComponent(sel.id)}`}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", textDecoration: "none" }}
                >
                  → Marketへ
                </a>

                <button
                  onClick={() => copyId(sel.id)}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
                >
                  {copied === sel.id ? "Copied" : "IDコピー"}
                </button>
              </div>

              <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
                ※ 命名/出品は対象グリッドが選択された状態で開きます（コピペ不要）
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}