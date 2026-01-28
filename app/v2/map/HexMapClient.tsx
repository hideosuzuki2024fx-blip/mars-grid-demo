"use client";

import { useMemo, useState } from "react";
import {
  generateHexCells,
  hexCornersKmPoint,
  HexCell,
} from "@/lib/hex";

const HEX_SIZE_KM = 1;          // 1km per hex
const MAX_RADIUS = 14;          // 上限（opportunity と揃える）

export default function HexMapClient() {
  // ===== state =====
  const [radius, setRadius] = useState(4);

  // ===== hex data =====
  const hexes: HexCell[] = useMemo(() => {
    return generateHexCells(radius, HEX_SIZE_KM);
  }, [radius]);

  // ===== viewBox 計算 =====
  const view = useMemo(() => {
    if (hexes.length === 0) {
      return "-5 -5 10 10";
    }

    const xs = hexes.map((h) => h.xKm);
    const ys = hexes.map((h) => h.yKm);

    const minX = Math.min(...xs) - HEX_SIZE_KM * 2;
    const maxX = Math.max(...xs) + HEX_SIZE_KM * 2;
    const minY = Math.min(...ys) - HEX_SIZE_KM * 2;
    const maxY = Math.max(...ys) + HEX_SIZE_KM * 2;

    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [hexes]);

  // ===== render =====
  return (
    <div className="flex h-full w-full flex-col">
      {/* ===== controls ===== */}
      <div className="flex items-center gap-4 border-b px-4 py-2 text-sm">
        <div>
          Hex radius: <b>{radius}</b>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_RADIUS}
          step={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="flex-1"
        />
        <div className="opacity-60">
          cells: {hexes.length}
        </div>
      </div>

      {/* ===== map ===== */}
      <div className="flex-1 overflow-hidden">
        <svg
          viewBox={view}
          className="h-full w-full bg-black"
        >
          {/* axes (debug) */}
          <line x1={-1000} y1={0} x2={1000} y2={0} stroke="#222" />
          <line x1={0} y1={-1000} x2={0} y2={1000} stroke="#222" />

          {/* hex cells */}
          {hexes.map((hex) => {
            const corners = hexCornersKmPoint(
              hex.xKm,
              hex.yKm,
              HEX_SIZE_KM
            );

            const points = corners
              .map((p) => `${p.xKm},${p.yKm}`)
              .join(" ");

            return (
              <polygon
                key={hex.id}
                points={points}
                fill="rgba(0, 200, 255, 0.08)"
                stroke="rgba(0, 200, 255, 0.6)"
                strokeWidth={0.05}
              />
            );
          })}

          {/* center marker */}
          <circle cx={0} cy={0} r={0.1} fill="red" />
        </svg>
      </div>
    </div>
  );
}
