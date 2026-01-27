// lib/hex.ts
// Hex grid helpers (axial coordinates, pointy-top) for the Opportunity local demo.
//
// coordinate system (demo):
// - World space is XY in kilometers.
// - Origin (0,0) is The landing point.
// - +X is East (right), +Y is North (up).
//
// Hex math:
// - Axial coords (q,r), cube coords are (x=q, z=r, y=-x-z)
// - Ring radius N => total cells = 1 + 3*N*(N+1)

export type Axial = { q: number; r: number };

export type HexCell = {
  id: string; // e.g. HEX_0_0
  q: number;
  r: number;
  xKm: number; // center position in km
  yKm: number;
};

export function hexId(q: number, r: number) {
  return `HEX_${q}_${r}`;
}

export function axialDistance(a: Axial, b: Axial) {
  // cube distance
  const ax = a.q, az = a.r, ay = -ax - az;
  const bx = b.q, bz = b.r, by = -bx - bz;
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz));
}

export function axialToKmPointy(q: number, r: number, sizeKm: number) {
  // Pointy-top axial -> pixel, adapted to km.
  // x = size * sqrt(3) * (q + r/2)
  // y = size * 3/2 * r
  const x = sizeKm * Math.sqrt(3) * (q + r / 2);
  const y = sizeKm * 1.5 * r;
  return { xKm: x, yKm: y };
}

export function generateHexCells(radiusRings: number, sizeKm: number): HexCell[] {
  const cells: HexCell[] = [];
  for (let q = -radiusRings; q <= radiusRings; q++) {
    const r1 = Math.max(-radiusRings, -q - radiusRings);
    const r2 = Math.min(radiusRings, -q + radiusRings);
    for (let r = r1; r <= r2; r++) {
      const { xKm, yKm } = axialToKmPointy(q, r, sizeKm);
      cells.push({ id: hexId(q, r), q, r, xKm, yKm });
    }
  }
  return cells;
}

export function hexCornersKmPoint(xKm: number, yKm: number, sizeKm: number) {
  // 6 corners around a center for a pointy-top hex.
  const corners: { xKm: number; yKm: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    corners.push({
      xKm: xKm + sizeKm * Math.cos(angle),
      yKm: yKm + sizeKm * Math.sin(angle),
    });
  }
  return corners;
}

export function nearestHexByKm(cells: HexCell[], xKm: number, yKm: number) {
  let best: HexCell | null = null;
  let bestD2 = Infinity;
  for (const c of cells) {
    const dx = c.xKm - xKm;
    const dy = c.yKm - yKm;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      best = c;
    }
  }
  return best;
}
