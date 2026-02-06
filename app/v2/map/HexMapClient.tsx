"use client";

import { useMemo, useState } from "react";
import { generateHexCells, hexCornersKmPoint, type HexCell } from "@/lib/hex";

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
  const [nRings, setNRings] = useState(4);
  const sizeKm = 1.1;
  const cells = useMemo(() => generateHexCells(nRings, sizeKm), [nRings]);
  const [selected, setSelected] = useState("HEX_0_0");

  const selectedCell = useMemo(
    () => cells.find((c) => c.id === selected) ?? null,
    [cells, selected]
  );

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
  const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 md:p-8">
      <header className="space-y-2">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">v2 Map</h1>
            <p className="text-sm text-neutral-300">
              Hex map view (same rendering style as /v2/opportunity).
            </p>
          </div>

          <nav className="flex gap-3 text-sm">
            <a className="text-sky-300 underline" href="/v1/join">Join</a>
            <a className="text-sky-300 underline" href="/v2/me">My Page</a>
            <a className="text-sky-300 underline" href="/v1/map">v1 Map</a>
          </nav>
        </div>
      </header>

      <section className="mt-4 grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-2">
            <div className="text-sm text-neutral-700">
              Selected: <span className="font-mono">{selected}</span>
            </div>
            <div className="text-xs text-neutral-600">
              rings <span className="font-mono">{nRings}</span> / cells <span className="font-mono">{cells.length}</span>
            </div>
          </div>

          <svg
            className="h-[70vh] w-full rounded-xl bg-neutral-50"
            viewBox={viewBox}
            role="img"
            aria-label="v2 hex map"
          >
            <g>
              {cells.map((c) => {
                const isSelected = c.id === selected;
                const fill = isSelected ? "#E0F2FE" : "#FAFAFA";
                const stroke = isSelected ? "#0284C7" : "#D4D4D8";
                return (
                  <polygon
                    key={c.id}
                    points={polygonPoints(c, sizeKm)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={0.06}
                    onClick={() => setSelected(c.id)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        <aside className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">Map controls</h2>

          <label className="mt-3 block text-sm text-neutral-700">
            Radius rings: <span className="font-mono">{nRings}</span>
          </label>
          <input
            type="range"
            min={1}
            max={14}
            value={nRings}
            onChange={(e) => {
              setNRings(Number(e.target.value));
              setSelected("HEX_0_0");
            }}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-300"
          />

          <div className="mt-4 rounded-xl border bg-neutral-50 p-3 text-sm text-neutral-700">
            <div><b>ID</b>: {selectedCell?.id ?? "-"}</div>
            <div><b>q</b>: {selectedCell?.q ?? "-"}</div>
            <div><b>r</b>: {selectedCell?.r ?? "-"}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
