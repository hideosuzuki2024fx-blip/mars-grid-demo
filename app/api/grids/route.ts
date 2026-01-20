import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const rows = 10;
  const cols = 20;

  const grids = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gridId = `GRID-${String(r).padStart(2, "0")}-${String(c).padStart(2, "0")}`;
      grids.push({
        gridId,
        name: `Sector ${r}-${c}`,
        tokenId: r * cols + c,
      });
    }
  }

  return NextResponse.json({ grids });
}
