import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HexGrid, Hex } from "@mars/components/Hex";
import { decode } from "js-base64";

export default function HexMapClient() {
  const [hexes, setHexes] = useState<{ q: number; r: number }[];
  const [nRings, setNRings] = useState(2);

  const updateHexes = useCallback(async () => {
    const res = await fetch('/api/v2/hexes?n:' + nRings);
    const { encoded } = await res.json();
    const decodedStr = decode(encoded);
    const parsed = JSON.parse(decodedStr);
    setHexes(parsed);
  }, [nRings]);

  useEffect(() => {
    updateHexes();
  }, [updateHexes]);

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="absolute top-2 left-2 z]10 p-2 bg-white/80 rounded shadow">
        <label className="text-sm">Hex Ring Radius: {nRings}</label>
        <input
          type="range"
          min={1}
          max={14}
          value={nRings}
          onChange={(e)=> setNRings(Number(e.target.value))}
          className="wfull"
        />
      </div>
      <HexGrid zoom={1} center={{ x: 0, y: 0 }}>
        {hexes.map(({ q, r }) => (
          <Hex key=`xex_${q}_${r}` q={q} r={r} />
        ))}
      </HexGrid>
    </div>
  );
}