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
  const [nRings, setNRings] = useState(2);
  const hexes = useMemo(() => generateHexes(nRings), [nRings]);

  return (
    <div className="w-full h-full overflow-hidden p-4">
      <div className="mb-4 p-2 bg-white/80 rounded shadow">
        <label className="text-sm">Hex Ring Radius: {nRings}</label>
        <input
          type="range"
          min={1}
          max={14}
          value={nRings}
          onChange={(e)=> setNRings(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <p className="text-sm text-gray-600 mb-2">Generated hexes: {hexes.length}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {hexes.map(({ q, r }) => (
          <div key={`hex_${q}_${r}`} className="rounded border px-2 py-1 bg-white">
            q:{q} r:{r}
          </div>
        ))}
      </div>
    </div>
  );
}
