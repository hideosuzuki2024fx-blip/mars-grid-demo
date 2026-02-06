"use client";

import { useMemo, useState } from "react";

type HexCoord = { q: number; r: number };

function generateHexes(n: number): HexCoord[] {
  const out: HexCoord[] = [];
  for (let q = -n; q <= n; q += 1) {
    const r1 = Math.max(-n, -q - n);
    const r2 = Math.min(n, -q + n);
    for (let r = r1; r <= r2; r += 1) {
      out.push({ q, r });
    }
  }
  return out;
}

export default function HexMapClient() {
  const [nRings, setNRings] = useState(3);
  const hexes = useMemo(() => generateHexes(nRings), [nRings]);
  const edgeLength = nRings * 2 + 1;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 md:p-8">
      <section className="rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-6 shadow-[0_0_80px_rgba(56,189,248,0.15)] backdrop-blur md:p-8">
        <p className="mb-3 inline-block rounded-full border border-cyan-300/40 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-200">
          MARS GRID COMMAND
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
          Hex Sector Visualizer
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
          リング半径を調整して、探索対象セクター数をリアルタイム確認します。
        </p>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/75 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Radius</p>
          <p className="mt-1 text-2xl font-bold text-white">{nRings}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/75 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Hex Count</p>
          <p className="mt-1 text-2xl font-bold text-white">{hexes.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/75 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Grid Width</p>
          <p className="mt-1 text-2xl font-bold text-white">{edgeLength}</p>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-cyan-300/20 bg-slate-900/75 p-5 backdrop-blur">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Hex Ring Radius: {nRings}
        </label>
        <input
          type="range"
          min={1}
          max={8}
          value={nRings}
          onChange={(e) => setNRings(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-300"
        />
      </section>

      <section className="mt-5 rounded-2xl border border-cyan-300/20 bg-slate-900/75 p-4 backdrop-blur md:p-5">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {hexes.map(({ q, r }) => (
            <div
              key={`hex_${q}_${r}`}
              className="rounded-xl border border-cyan-300/20 bg-slate-950/80 px-2 py-2 text-center transition hover:-translate-y-0.5 hover:border-cyan-200/60 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]"
            >
              <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">sector</span>
              <p className="text-xs font-semibold text-cyan-100">{`q:${q} / r:${r}`}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
