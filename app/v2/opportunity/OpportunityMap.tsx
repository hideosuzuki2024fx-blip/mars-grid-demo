import { hexCornersKmPoint, type HexCell } from "@/lib/hex";

type Props = {
  cells: HexCell[];
  sizeKm: number;
  selected: string;
  eventCellIds: Set<string>;
  onSelect: (id: string) => void;
};

function kmToSvg(xKm: number, yKm: number) {
  // SVG y grows down; world y grows up -> invert
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

export default function OpportunityMap({
  cells,
  sizeKm,
  selected,
  eventCellIds,
  onSelect,
}: Props) {
  // Compute viewBox from corner extents
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

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

  const origin = cells.find((c) => c.id === "HEX_0_0");

  return (
    <svg
      className="h-[70vh] w-full rounded-xl bg-neutral-50"
      viewBox={viewBox}
      role="img"
      aria-label="Opportunity hex grid"
    >
      <g>
        {cells.map((c) => {
          const isSelected = c.id === selected;
          const isEvent = eventCellIds.has(c.id);
          const fill = isSelected ? "#E0F2FE" : isEvent ? "#FEF3C7" : "#FAFAFA";
          const stroke = isSelected ? "#0284C7" : "#D5D5D5";
          return (
          <polygon
            key={c.id}
            points={polygonPoints(c, sizeKm)}
            fill={fill}
            stroke={stroke}
            strokeWidth={0.06}
            onClick={() => onSelect(c.id)}
            style={{ cursor: "pointer" }}
          />
        );
      })}

        {origin ? (() => {
          const p = kmToSvg(origin.xKm, origin.yKm);
          return <circle cx={p.x} cy={p.y} r={0.18} fill="#111827" />;
        })() : null}

      </g>
    </svg>
  );
}
