"use client";

import { useMemo, useState } from "react";
import {
  generateHexCells,
  hexCornersKmPoint,
  axialDistance,
  HexCell,
} from "@/lib/hex";

const HEX_SIZE_KM = 1;

export default function HexMapClient() {
  const [radius, setRadius] = useState<number>(4);

  const allCells = useMemo(() => {
    return generateHexCells(14, HEX_SIZE_KM);
  }, []);

  const visibleCells = useMemo(() => {
    return allCells.filter((c) =>
      axialDistance({ q: 0, r: 0 }, { q: c.q, r: c.r }) <= radius
    );
  }, [allCells, radius]);

  const viewBox = useMemo(() => {
    if (visibleCells.length === 0) {
      return "-10 -10 20 20";
    }

    const xs: number[] = [];
    const ys: number[] = [];

    for (const c of visibleCells) {
      const corners = hexCornersKmPoint(c.xKm, c.yKm, HEX_SIZE_KM);
      for (const p of corners) {
        xs.push(p.xKm);
        ys.push(p.yKm);
      }
    }

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return `${minX - 1} ${minY - 1} ${maxX - minX + 2} ${maxY - minY + 2}`;
  }, [visibleCells]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex items-center gap-4 px-4">
        <label className="text-sm">
          Hex radius (rings): <b>{radius}</b>
        </label>
        <input
          type="range"
          min={0}
          max={14}
          step={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      <div className="flex-1 border">
        <svg
          viewBox={viewBox}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          {visibleCells.map((cell: HexCell) => {
            const corners = hexCornersKmPoint(
              cell.xKm,
              cell.yKm,
              HEX_SIZE_KM
            );
            const points = corners
              .map((p) => `${p.xKm},${p.yKm}`)
              .join(" ");

            return (
              <polygon
                key={cell.id}
                points={points}
                fill="none"
                stroke="#ff6a00"
                strokeWidth={0.05}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
