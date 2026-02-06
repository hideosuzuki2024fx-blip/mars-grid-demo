"use client";

import { useEffect, useMemo, useState } from "react";

import { useGridParam } from "../_shared/useGridParam";
type Grid = {
  id: string;
  r: number;
  c: number;
  name: string | null;
  locked: boolean;
  owner_handle: string | null;
};

type Listing = {
  id: string;
  grid_id: string;
  price: number;
  seller_handle: string;
};

type PanelMode = "none" | "me" | "market";

export default function MapPage() {
  const { gridId: gridParamId, setGridId: setGridParamId } = useGridParam();
const [grids, setGrids] = useState<Grid[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sel, setSel] = useState<Grid | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [myHandle, setMyHandle] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  // ズーム
  const [zoom, setZoom] = useState<1 | 1.5 | 2>(1);
  const BASE_CELL = 32;
  const HEX_W = Math.round(BASE_CELL * zoom);
  const HEX_H = Math.round(HEX_W * 0.9);
  const STEP_X = Math.round(HEX_W * 0.9);
  const STEP_Y = Math.round(HEX_H * 0.78);

  // Mapを開いたまま操作する右パネル
  const [panel, setPanel] = useState<PanelMode>("none");

  const listingByGrid = useMemo(() => {
    const m: Record<string, Listing> = {};
    for (const l of listings) m[l.grid_id] = l;
    return m;
  }, [listings]);

  async function loadMe() {
    try {
      const r = await fetch("/api/v1/me", { cache: "no-store" });
      const j = await r.json();
      if (j.ok && j.user?.handle) setMyHandle(j.user.handle);
    } catch {
      // 未参加でもMapは見えるので無視
    }
  }

  async function loadAll() {
    try {
      setErr(null);
      const [rg, rm] = await Promise.all([
        fetch("/api/v1/grids", { cache: "no-store" }),
        fetch("/api/v1/market", { cache: "no-store" }),
      ]);

      const jg = await rg.json();
      if (!jg.ok) throw new Error(jg.error ?? "GRIDS_FAILED");
      setGrids(jg.grids);

      const jm = await rm.json();
      if (!jm.ok) throw new Error(jm.error ?? "MARKET_FAILED");
      setListings(jm.listings);
    } catch (e: any) {
      setErr(e?.message ?? "LOAD_FAILED");
    }
  }

  useEffect(() => {
    loadMe();
    loadAll();
  }, []);

  
  // URL grid -> select
  useEffect(() => {
    if (!gridParamId) return;
    if (sel?.id === gridParamId) return;
    const g = grids.find((x) => x.id === gridParamId);
    if (g) setSel(g);
  }, [gridParamId, grids, sel]);

  // select -> URL grid (keep in sync)
  useEffect(() => {
    if (!sel) return;
    if (sel.id === gridParamId) return;
    setGridParamId(sel.id);
  }, [sel, gridParamId, setGridParamId]);

  const layout = useMemo(() => {
    if (!grids.length) return { byId: {} as Record<string, { x: number; y: number }>, width: 0, height: 0 };
    const byId: Record<string, { x: number; y: number }> = {};
    let maxX = 0;
    let maxY = 0;
    for (const g of grids) {
      const x = g.c * STEP_X + (g.r % 2 ? Math.round(HEX_W / 2) : 0);
      const y = g.r * STEP_Y;
      byId[g.id] = { x, y };
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return {
      byId,
      width: maxX + HEX_W + 16,
      height: maxY + HEX_H + 16,
    };
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
    if (isSel) return "3px solid #4AA3FF";

    // 出品中は見えるように枠を強める（lockedでもあるが明示）
    const listed = !!listingByGrid[g.id];
    if (listed) return "3px solid #FF4AA3";

    if (g.locked) return "3px solid #F7D94C";
    if (isMine(g)) return "2px solid rgba(255,255,255,0.85)";
    return "1px solid #444";
  }

  async function buySelected() {
    if (!sel) return;
    const l = listingByGrid[sel.id];
    if (!l) return;

    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/v1/market/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId: l.id }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "BUY_FAILED");
      await loadMe();
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "BUY_FAILED");
    } finally {
      setBusy(false);
    }
  }

  const selectedId = gridParamId || sel?.id || "";
  const meUrl = selectedId ? `/v1/me?grid=${encodeURIComponent(selectedId)}&embed=1` : "/v1/me?embed=1";
  const marketUrl = selectedId ? `/v1/market?grid=${encodeURIComponent(selectedId)}&embed=1` : "/v1/market?embed=1";

  const selectedListing = selectedId ? listingByGrid[selectedId] : null;
  const isListed = !!selectedListing;
  const canBuy = isListed && selectedListing!.seller_handle !== myHandle;

  return (
    <div style={{ position: "relative" }}>
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
            onClick={loadAll}
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
          <span style={{ width: 14, height: 14, background: "#111", borderRadius: 4, border: "3px solid #FF4AA3" }} />
          出品中
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            border: "1px solid #333",
            padding: 10,
            borderRadius: 12,
            maxWidth: "100%",
            overflow: "auto",
          }}
        >
          <div style={{ position: "relative", width: layout.width, height: layout.height }}>
            {grids.map((g) => {
              const bg = colorFor(g);
              const bd = borderFor(g);
              const selected = sel?.id === g.id;
              const mine = isMine(g);
              const listed = !!listingByGrid[g.id];
              const price = listed ? listingByGrid[g.id].price : null;
              const pos = layout.byId[g.id] || { x: 0, y: 0 };

              return (
                <div
                  key={g.id}
                  style={{ width: HEX_W, height: HEX_H, position: "absolute", left: pos.x, top: pos.y }}
                  title={
                    listed
                      ? `${g.id}\nFOR SALE: ${price} CX\nseller: ${listingByGrid[g.id].seller_handle}\nOwner: ${g.owner_handle ?? "-"}\nName: ${g.name ?? "-"}`
                      : `${g.id}\nOwner: ${g.owner_handle ?? "-"}\nName: ${g.name ?? "-"}`
                  }
                >
                  <button
                    onClick={() => { setSel(g); setGridParamId(g.id); }}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: bg,
                      border: bd,
                      cursor: "pointer",
                      transform: selected ? "scale(1.02)" : "none",
                      clipPath: "polygon(25% 4%, 75% 4%, 98% 50%, 75% 96%, 25% 96%, 2% 50%)",
                    }}
                  />
                  {mine && (
                    <div
                      style={{
                        position: "absolute",
                        top: Math.max(3, Math.round(HEX_H * 0.14)),
                        right: Math.max(8, Math.round(HEX_W * 0.27)),
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
                  {listed && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: Math.max(2, Math.round(HEX_H * 0.12)),
                        left: Math.max(8, Math.round(HEX_W * 0.24)),
                        fontSize: Math.max(9, Math.round(10 * zoom)),
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.95)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.65)",
                        pointerEvents: "none",
                        userSelect: "none",
                        lineHeight: 1,
                      }}
                    >
                      {zoom >= 1.5 ? `${price}CX` : "SALE"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ minWidth: 380 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Selected</h3>

          {!sel ? (
            <div style={{ opacity: 0.8 }}>セルをクリックしてください。</div>
          ) : (
            <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
              <div><b>ID</b>: {sel.id}</div>
              <div><b>Owner</b>: {sel.owner_handle ?? "-"}</div>
              <div><b>Name</b>: {sel.name ?? "-"}</div>
              <div><b>Locked</b>: {sel.locked ? "YES" : "NO"}</div>

              <div style={{ marginTop: 10, padding: 10, border: "1px solid #222", borderRadius: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Market Status</div>
                {!selectedListing ? (
                  <div style={{ opacity: 0.85 }}>出品なし</div>
                ) : (
                  <div style={{ display: "grid", gap: 4 }}>
                    <div><b>FOR SALE</b>: {selectedListing.price} CX</div>
                    <div><b>Seller</b>: {selectedListing.seller_handle}</div>

                    {selectedListing.seller_handle === myHandle ? (
                      <div style={{ opacity: 0.85 }}>あなたの出品です</div>
                    ) : (
                      <button
                        onClick={buySelected}
                        disabled={busy || !canBuy}
                        style={{
                          marginTop: 8,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid #333",
                          cursor: "pointer",
                        }}
                      >
                        {busy ? "..." : "Buy（ここで購入）"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setPanel("me")}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
                >
                  命名（パネル）
                </button>

                <button
                  onClick={() => setPanel("market")}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
                >
                  Market（パネル）
                </button>

                <button
                  onClick={() => copyId(sel.id)}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
                >
                  {copied === sel.id ? "Copied" : "IDコピー"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右スライドパネル */}
      {panel !== "none" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "min(520px, 95vw)",
            height: "100vh",
            background: "#0d0d0d",
            borderLeft: "1px solid #222",
            zIndex: 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: 10, borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>
              {panel === "me" ? "命名" : "Market"} / {selectedId || "-"}
            </div>
            <button
              onClick={() => setPanel("none")}
              style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
            >
              Close
            </button>
          </div>

          <iframe
            key={`${panel}:${selectedId}`}
            src={panel === "me" ? meUrl : marketUrl}
            style={{ flex: 1, width: "100%", border: "none" }}
          />
        </div>
      )}
    </div>
  );
}





