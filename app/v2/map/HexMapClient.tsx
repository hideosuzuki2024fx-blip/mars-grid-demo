"use client";

import { useEffect, useMemo, useState } from "react";

import { axialToKmPointy, hexCornersKmPoint } from "@/lib/hex";
import { useGridParam } from "@/app/v1/_shared/useGridParam";

type Grid = {
  id: string;
  r: number;
  c: number;
  q: number | null;
  hex_r: number | null;
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

type HexCell = {
  id: string;
  grid: Grid;
  q: number;
  r: number;
  xKm: number;
  yKm: number;
};

const NEIGHBOR_DIRS: Array<[number, number]> = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

function kmToSvg(xKm: number, yKm: number) {
  return { x: xKm, y: -yKm };
}

function polygonPoints(cell: HexCell, sizeKm: number) {
  const corners = hexCornersKmPoint(cell.xKm, cell.yKm, sizeKm);
  return corners
    .map((p) => {
      const s = kmToSvg(p.xKm, p.yKm);
      return `${s.x},${s.y}`;
    })
    .join(" ");
}

export default function HexMapClient() {
  const { gridId: gridParamId, setGridId: setGridParamId } = useGridParam();

  const [grids, setGrids] = useState<Grid[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sel, setSel] = useState<Grid | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<PanelMode>("none");
  const [showEvents, setShowEvents] = useState(true);

  const [zoom, setZoom] = useState<1 | 1.4 | 1.8>(1);
  const BASE_SIZE_KM = 1;
  const sizeKm = BASE_SIZE_KM * zoom;

  const listingByGrid = useMemo(() => {
    const m: Record<string, Listing> = {};
    for (const l of listings) m[l.grid_id] = l;
    return m;
  }, [listings]);

  const axialById = useMemo(() => {
    const m = new Map<string, { q: number; r: number }>();
    for (const g of grids) {
      if (g.q == null || g.hex_r == null) continue;
      m.set(g.id, { q: g.q, r: g.hex_r });
    }
    return m;
  }, [grids]);

  const gridByAxial = useMemo(() => {
    const m = new Map<string, Grid>();
    for (const g of grids) {
      if (g.q == null || g.hex_r == null) continue;
      m.set(`${g.q},${g.hex_r}`, g);
    }
    return m;
  }, [grids]);

  const cells = useMemo(() => {
    return grids.flatMap((g) => {
      if (g.q == null || g.hex_r == null) return [];
      const { xKm, yKm } = axialToKmPointy(g.q, g.hex_r, sizeKm);
      return [
        {
          id: g.id,
          grid: g,
          q: g.q,
          r: g.hex_r,
          xKm,
          yKm,
        },
      ];
    });
  }, [grids, sizeKm]);

  const viewBox = useMemo(() => {
    if (!cells.length) return "0 0 10 10";
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const c of cells) {
      const corners = hexCornersKmPoint(c.xKm, c.yKm, sizeKm);
      for (const p of corners) {
        const s = kmToSvg(p.xKm, p.yKm);
        minX = Math.min(minX, s.x);
        minY = Math.min(minY, s.y);
        maxX = Math.max(maxX, s.x);
        maxY = Math.max(maxY, s.y);
      }
    }

    const pad = sizeKm * 2;
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  }, [cells, sizeKm]);

  const eventCellIds = useMemo(() => {
    // Placeholder for future event API integration.
    return new Set<string>();
  }, []);

  const activeEventCellIds = useMemo(() => {
    return showEvents ? eventCellIds : new Set<string>();
  }, [eventCellIds, showEvents]);

  const neighborIds = useMemo(() => {
    if (!sel) return new Set<string>();
    const axial = axialById.get(sel.id);
    if (!axial) return new Set<string>();
    const ids = new Set<string>();
    for (const [dq, dr] of NEIGHBOR_DIRS) {
      const neighbor = gridByAxial.get(`${axial.q + dq},${axial.r + dr}`);
      if (neighbor) ids.add(neighbor.id);
    }
    return ids;
  }, [sel, axialById, gridByAxial]);

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

  useEffect(() => {
    if (!gridParamId) return;
    if (sel?.id === gridParamId) return;
    const g = grids.find((x) => x.id === gridParamId);
    if (g) setSel(g);
  }, [gridParamId, grids, sel]);

  useEffect(() => {
    if (!sel) return;
    if (sel.id === gridParamId) return;
    setGridParamId(sel.id);
  }, [sel, gridParamId, setGridParamId]);

  function isMine(g: Grid) {
    return !!g.owner_handle && !!myHandle && g.owner_handle === myHandle;
  }

  function colorFor(g: Grid) {
    const owned = !!g.owner_handle;
    if (isMine(g)) return "#BFDBFE";
    if (owned) return "#BBF7D0";
    return "#F8FAFC";
  }

  function strokeFor(g: Grid, isSelected: boolean, isNeighbor: boolean) {
    if (isSelected) return "#0284C7";
    if (isNeighbor) return "#F59E0B";
    if (listingByGrid[g.id]) return "#EC4899";
    if (g.locked) return "#FACC15";
    return "#CBD5F5";
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

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied(null), 800);
    } catch {
      setErr("コピーに失敗しました（ブラウザ設定の可能性）");
    }
  }

  const selectedId = gridParamId || sel?.id || "";
  const selectedListing = selectedId ? listingByGrid[selectedId] : null;
  const isListed = !!selectedListing;
  const canBuy = isListed && selectedListing!.seller_handle !== myHandle;

  const meUrl = selectedId
    ? `/v1/me?grid=${encodeURIComponent(selectedId)}&embed=1`
    : "/v1/me?embed=1";
  const marketUrl = selectedId
    ? `/v1/market?grid=${encodeURIComponent(selectedId)}&embed=1`
    : "/v1/market?embed=1";

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">v2 Map (Hex)</h1>
              <p className="text-sm text-neutral-600">
                Hex cells are aligned to v1 grids using q/r axial coordinates.
              </p>
            </div>
            <nav className="flex gap-3 text-sm">
              <a className="text-sky-700 underline" href="/v2/me">My Page</a>
              <a className="text-sky-700 underline" href="/v2/opportunity">Opportunity</a>
              <a className="text-sky-700 underline" href="/v1/map">v1 Map</a>
            </nav>
          </div>
        </header>

        {err ? <div className="text-sm text-red-600">Error: {err}</div> : null}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2">
            <span className="text-neutral-700">Zoom</span>
            <button
              className={`rounded-lg border px-2 py-1 ${zoom === 1 ? "border-sky-400" : "border-neutral-300"}`}
              onClick={() => setZoom(1)}
            >
              1x
            </button>
            <button
              className={`rounded-lg border px-2 py-1 ${zoom === 1.4 ? "border-sky-400" : "border-neutral-300"}`}
              onClick={() => setZoom(1.4)}
            >
              1.4x
            </button>
            <button
              className={`rounded-lg border px-2 py-1 ${zoom === 1.8 ? "border-sky-400" : "border-neutral-300"}`}
              onClick={() => setZoom(1.8)}
            >
              1.8x
            </button>
          </div>

          <button
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2"
            onClick={loadAll}
          >
            Reload
          </button>

          <label className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2">
            <input
              type="checkbox"
              checked={showEvents}
              onChange={(e) => setShowEvents(e.target.checked)}
            />
            <span>Event highlight</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-700">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-neutral-400 bg-blue-300" />
            自分
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-neutral-400 bg-green-300" />
            他人
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-neutral-400 bg-slate-50" />
            未所有
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border-2 border-pink-400 bg-white" />
            出品中
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border-2 border-amber-400 bg-white" />
            近傍セル
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border bg-white p-3 shadow-sm">
            <svg
              className="h-[70vh] w-full rounded-xl bg-neutral-50"
              viewBox={viewBox}
              role="img"
              aria-label="v2 hex map"
            >
              <g>
                {cells.map((c) => {
                  const g = c.grid;
                  const isSelected = sel?.id === g.id;
                  const isNeighbor = neighborIds.has(g.id);
                  const isEvent = activeEventCellIds.has(g.id);
                  const fill = isSelected
                    ? "#E0F2FE"
                    : isNeighbor
                      ? "#FEF3C7"
                      : isEvent
                        ? "#FDE68A"
                        : colorFor(g);
                  const stroke = strokeFor(g, isSelected, isNeighbor);
                  const strokeWidth = isSelected ? 0.14 : isNeighbor ? 0.12 : 0.08;

                  return (
                    <polygon
                      key={g.id}
                      points={polygonPoints(c, sizeKm)}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      onClick={() => {
                        setSel(g);
                        setGridParamId(g.id);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  );
                })}
              </g>
            </svg>
          </section>

          <aside className="space-y-3">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold">Selected</h2>
              {!sel ? (
                <p className="mt-2 text-sm text-neutral-600">セルをクリックしてください。</p>
              ) : (
                <div className="mt-2 space-y-1 text-sm">
                  <div><b>ID</b>: {sel.id}</div>
                  <div><b>Owner</b>: {sel.owner_handle ?? "-"}</div>
                  <div><b>Name</b>: {sel.name ?? "-"}</div>
                  <div><b>Locked</b>: {sel.locked ? "YES" : "NO"}</div>
                  <div>
                    <b>Axial</b>: q={sel.q ?? "-"}, r={sel.hex_r ?? "-"}
                  </div>

                  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-semibold text-neutral-700">Market Status</div>
                    {!selectedListing ? (
                      <div className="mt-1 text-xs text-neutral-600">出品なし</div>
                    ) : (
                      <div className="mt-2 space-y-1 text-xs text-neutral-700">
                        <div><b>FOR SALE</b>: {selectedListing.price} CX</div>
                        <div><b>Seller</b>: {selectedListing.seller_handle}</div>
                        {selectedListing.seller_handle === myHandle ? (
                          <div className="text-neutral-500">あなたの出品です</div>
                        ) : (
                          <button
                            onClick={buySelected}
                            disabled={busy || !canBuy}
                            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs"
                          >
                            {busy ? "..." : "Buy（ここで購入）"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setPanel("me")}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs"
                    >
                      命名（パネル）
                    </button>
                    <button
                      onClick={() => setPanel("market")}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs"
                    >
                      Market（パネル）
                    </button>
                    <button
                      onClick={() => copyId(sel.id)}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs"
                    >
                      {copied === sel.id ? "Copied" : "IDコピー"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {sel ? (
              <div className="rounded-2xl border bg-white p-4 text-xs text-neutral-700 shadow-sm">
                <div className="font-semibold">Neighbors</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from(neighborIds).map((id) => (
                    <button
                      key={id}
                      className="rounded-lg border border-neutral-300 bg-white px-2 py-1"
                      onClick={() => {
                        const next = grids.find((g) => g.id === id);
                        if (next) setSel(next);
                      }}
                    >
                      {id}
                    </button>
                  ))}
                  {neighborIds.size === 0 ? <span className="text-neutral-500">なし</span> : null}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      {panel !== "none" && (
        <div className="fixed right-0 top-0 z-50 flex h-screen w-[min(520px,95vw)] flex-col border-l border-neutral-800 bg-neutral-950 text-white">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-800 p-3 text-sm">
            <div className="font-semibold">
              {panel === "me" ? "命名" : "Market"} / {selectedId || "-"}
            </div>
            <button
              onClick={() => setPanel("none")}
              className="rounded-lg border border-neutral-700 px-3 py-1 text-xs"
            >
              Close
            </button>
          </div>
          <iframe
            key={`${panel}:${selectedId}`}
            src={panel === "me" ? meUrl : marketUrl}
            className="h-full w-full border-none"
          />
        </div>
      )}
    </main>
  );
}
