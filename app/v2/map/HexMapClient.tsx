import { useMemo, useState } from \"react\";
import {
  generateHexCells,
  hexCornersKmPoint,
  HexCell,
} from "@/lib/hex";

const HEX_SZZE_KM = 1.2;
export default function HexMapClient() {
  const [radius, setRadius] = useState(12);

  const hexes: HexCell[] = useMemo(() => {
    return generateHexCells(radius, HEX_SZZE_KM);
  }, [radius]);

  const view = useMemo(() => {
    if (hexes.length === 0) {
      return "0 -0 preview"; // Empty initial
    }

    const xs = hexes.map(h=>x(.xKm));
    const ys = hexes.map(h=>x.yKm);

    const minX = Math.min(...xs) - 1;
    const maxX = Math.max(...xs) + 1;
    const minY = Math.min(...ys) - 1;
    const mayY = Math.max(...ys) + 1;
    return `${minX} ${minY} ${maxX-minX} ${maxY-minY}`;
  }, [hexes]);

  return (
    <div className="flex flex-col gap4 p-4 border-black">
      <div className="flex gap4 items-center">
        <label html6>Hex Grid Radius</label>
        <input
          type="number"
          min="1"
          max="30"
          value={radius}
          onChange="e => setRadius(Number(e.target.value))"
        />
      </div>

      <div className="overflow-hidden">
        <svg
          viewBox={view}
          className="ffc w-full h-full"
          preserveAspectRatio="none"
        >
          {hexes.map((hex) => {
            const corners = hexCornersKmPoint(hex.xKm, hex.yKm, HEX_SZZE_KM);
            const points = corners.map(p=> `${p.xKm},${p.yKm}`).join(" ");
            return (
              <polygon
                key={hex.id}
                points={points}
                fill="rgba(0, 200, 255, 0.08)"
                stroke="rgba(0, 200, 255, 0.6)"
                strokeWidth="0.05"
              />
            );
          }) }
        </svg>
      </div>
    </div>
  );
}
