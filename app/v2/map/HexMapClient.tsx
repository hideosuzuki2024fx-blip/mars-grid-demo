"use client";

import { useEffect, useMemo, useState } from "react";

type Grid = {
  id: string;
  r: number;
  c: number;
  q?: number | null;
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

function hexPolygonPoints(cx: number, cy: number, size: number) {
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

export default function HexMapClient() {
  const [grids, setGrids] = useState<Grid[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [zoom, setZoom] = useState<1 | 1.5 | 2>(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const size = 15 * zoom;

  const listingByGrid = useMemo(() => {
    const m: Record<string, Listing> = {};
    for (const l of listings) m[l.grid_id] = l;
    return m;
  }, [listings]);

  const selected = useMemo(
    () => grids.find((g) => g.id === selectedId) ?? null,
    [grids, selectedId]
  );

  async function loadAll() {
    try {
      setErr(null);
      const [rg, rm, rme] = await Promise.all([
        fetch("/api/v1/grids", { cache: "no-store" }),
        fetch("/api/v1/market", { cache: "no-store" }),
        fetch("/api/v1/me", { cache: "no-store" }),
      ]);

      const jg = await rg.json();
      if (!jg.ok) throw new Error(jg.error ?? "GRIDS_FAILED");
      setGrids(jg.grids ?? []);
      if (!selectedId && jg.grids?.[0]?.id) setSelectedId(jg.grids[0].id);

      const jm = await rm.json();
      if (!jm.ok) throw new Error(jm.error ?? "MARKET_FAILED");
      setListings(jm.listings ?? []);

      const jme = await rme.json();
      if (jme.ok && jme.user?.handle) setMyHandle(jme.user.handle);
    } catch (e: any) {
      setErr(e?.message ?? "LOAD_FAILED");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isMine(g: Grid) {
    return !!g.owner_handle && !!myHandle && g.owner_handle === myHandle;
  }

  function fillFor(g: Grid) {
    if (isMine(g)) return "#1d4ed8";
    if (g.owner_handle) return "#166534";
    return "#111827";
  }

  function strokeFor(g: Grid) {
    if (selectedId === g.id) return { color: "#38bdf8", width: 1.8 };
    if (listingByGrid[g.id]) return { color: "#f472b6", width: 1.6 };
    if (g.locked) return { color: "#facc15", width: 1.4 };
    if (isMine(g)) return { color: "#93c5fd", width: 1.2 };
    return { color: "#94a3b8", width: 1 };
  }

  const points = useMemo(() => {
    const stepX = size * Math.sqrt(3);
    const stepY = size * 1.5;
    return grids.map((g) => {
      const x = g.c * stepX + (g.r % 2 ? stepX * 0.5 : 0);
      const y = g.r * stepY;
      return { g, x, y };
    });
  }, [grids, size]);

  const bounds = useMemo(() => {
    if (!points.length) return { minX: -20, minY: -20, width: 40, height: 40 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x - size);
      minY = Math.min(minY, p.y - size);
      maxX = Math.max(maxX, p.x + size);
      maxY = Math.max(maxY, p.y + size);
    }
    const pad = size * 1.8;
    return {
      minX: minX - pad,
      minY: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }, [points, size]);

  async function buySelected() {
    if (!selected) return;
    const listing = listingByGrid[selected.id];
    if (!listing) return;
    setBusy(true);
    try {
      const r = await fetch("/api/v1/market/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "BUY_FAILED");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "BUY_FAILED");
    } finally {
      setBusy(false);
    }
  }

  const selectedListing = selected ? listingByGrid[selected.id] : null;
  const canBuy = !!selectedListing && selectedListing.seller_handle !== myHandle;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 text-slate-200 md:p-8">
      <header className="space-y-2">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">v2 Map</h1>
            <p className="text-sm text-slate-400">
              v1 と同じ所有/出品仕様を Hex map で表示
            </p>
          </div>
          <nav className="flex gap-3 text-sm">
            <a className="text-sky-300 underline" href="/v1/join">Join</a>
            <a className="text-sky-300 underline" href="/v2/me">My Page</a>
            <a className="text-sky-300 underline" href="/v1/map">v1 Map</a>
          </nav>
        </div>
      </header>

      {err ? <div className="mt-3 text-sm text-rose-300">Error: {err}</div> : null}

      <section className="mt-4 grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-2">
            <div className="text-sm text-slate-200">
              Selected: <span className="font-mono">{selected?.id ?? "-"}</span>
            </div>
            <div className="text-xs text-slate-400">
              cells <span className="font-mono">{grids.length}</span>
            </div>
          </div>

          <svg
            className="h-[70vh] w-full rounded-xl bg-slate-950"
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
            role="img"
            aria-label="v2 hex map"
          >
            {points.map(({ g, x, y }) => {
              const stroke = strokeFor(g);
              const listed = !!listingByGrid[g.id];
              return (
                <g key={g.id}>
                  <polygon
                    points={hexPolygonPoints(x, y, size)}
                    fill={fillFor(g)}
                    stroke={stroke.color}
                    strokeWidth={stroke.width}
                    onClick={() => setSelectedId(g.id)}
                    style={{ cursor: "pointer" }}
                  />
                  {isMine(g) ? (
                    <text x={x + size * 0.25} y={y - size * 0.2} fontSize={size * 0.35} fontWeight={900} fill="#f8fafc">★</text>
                  ) : null}
                  {listed ? (
                    <text x={x - size * 0.45} y={y + size * 0.35} fontSize={size * 0.26} fontWeight={900} fill="#fbcfe8">
                      {zoom >= 1.5 ? `${listingByGrid[g.id].price}CX` : "SALE"}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm text-sm text-slate-200">
          <h2 className="text-base font-semibold text-slate-100">Map controls</h2>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Zoom</span>
            {[1, 1.5, 2].map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z as 1 | 1.5 | 2)}
                className={`rounded border px-2 py-1 text-xs ${zoom === z ? "border-sky-400 text-sky-300" : "border-slate-600 text-slate-300"}`}
              >
                {z}x
              </button>
            ))}
            <button onClick={loadAll} className="ml-auto rounded border border-slate-600 px-2 py-1 text-xs text-slate-200">
              Reload
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-3">
            <div><b>ID</b>: {selected?.id ?? "-"}</div>
            <div><b>Owner</b>: {selected?.owner_handle ?? "-"}</div>
            <div><b>Name</b>: {selected?.name ?? "-"}</div>
            <div><b>Locked</b>: {selected?.locked ? "YES" : "NO"}</div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-3">
            <div className="font-semibold">Market Status</div>
            {!selectedListing ? (
              <div className="mt-1 text-xs text-slate-400">出品なし</div>
            ) : (
              <div className="mt-1 space-y-1">
                <div><b>FOR SALE</b>: {selectedListing.price} CX</div>
                <div><b>Seller</b>: {selectedListing.seller_handle}</div>
                <button
                  onClick={buySelected}
                  disabled={!canBuy || busy}
                  className="mt-2 rounded border border-slate-600 px-2 py-1 text-xs text-slate-100 disabled:opacity-50"
                >
                  {busy ? "..." : "Buy"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
