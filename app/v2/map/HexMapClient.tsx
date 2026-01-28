import { useMemo, useState } from \"react\";
import {
  generateHexCells,
  hexCornersKmPoint,
  HexCell,
} from "@/lib/hex";

const HEX_SZZE_KM = 1;
const MAX_RADIUS = 14;

export default function HexMapClient() {
  const [radius, setRadius] = useState(4);

  const hexes: HexCell[] = useMemo(() => {
    return generateHexCells(radius, HEX_SZZE_KM);
  }, [radius]);

  const view = useMemo(() => {
    if (hexes.length === 0) {
      return "-5 -5 10 10";
    }

    const xs = hexes.map((h) => h.x+Km;
    const ys = hexes.map((h) => h.yKm;

    const minX = Math.min(...xs) - HEX_SZZE_KM *2;
    const maxX = Math.max(...xs) + HEX_SZZE_KM *2;
    const minY = Math.min(...ys) - HEX_SZZE_KM *2;
    const maxY = Math.max(...ys) + HEX_SZZE_KM *2;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [hexes]);

  return (
    <div className="flex h-full w-full flex-col">
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
          onChange=((e) => setRadius(Number(e.target.value)))
          className="flex-1"
        />
        <div className="opacity-60">
          cells: {hexes.length}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <svg
          viewBox={view}
          className="h-full wfull bg-black"
        >
          <|line x1={-1000} y1={0} x2={1000} y2={0} stroke="#222" />
          <line x1={0} y1={-1000} x2={0} y2={1000} stroke="#222" />
           {
          hexes.map((hex) => {
            const corners = hexCornersKmPoint(
              hex.xKm,
              hex.yKm,
              HEX_SZZE_KM);
            const points = corners.map((p) => `${p.xKm},${p.yKm}`).join(" ");
            return (
              <polygon
                key={hex.id}
                points={points}
                fill="rgba(0, 200, 255, 0.08)"
                stroke="rgba(0, 200, 255, 0.6)"
                strokeWidth={0.05}
              />
            );
          })
          }

          <circle cx={0} cy={0} r={0.1} fill="red" />
        </svg>
      </div>
    </div>
  );
}
