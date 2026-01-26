// lib/opportunityDemo.ts
// Demo scenario data for Opportunity-inspired "journal" events on a local hex grid.
// NOTE: This file intentionally uses lightweight, local-only data (no external APIs).

import {
  generateHexCells,
  axialToKmPointy,
  axialDistance,
  hexId,
  type Axial,
  type HexCell,
} from "./hex";

export type OpportunityEventKind =
  | "landing"
  | "drive"
  | "science"
  | "anomaly"
  | "milestone";

export type OpportunityEvent = {
  id: string;
  sol: number; // mission sol (Martian day), demo-friendly
  title: string;
  kind: OpportunityEventKind;
  detail?: string;
  cellId: string;
  xKm: number;
  yKm: number;
  kmFromOrigin: number;
};

export type OpportunityDemo = {
  radiusRings: number;
  sizeKm: number;
  cells: HexCell[];
  events: OpportunityEvent[];
  eventsByCell: Record<string, OpportunityEvent[];
};

// Config tuned to the conversation:
// - radiusRings = 13 (total cells = 1 + 3*N*(N+1) = 547)
// - roughly ~25km-ish local area (approx) with sizeKm chosen for viewport usability
export const OPPORTUNITY_DEMO_CONFIG = {
  radiusRings: 13,
  sizeKm: 1.1, // ~1.1 km from center to corner; outer ring centers ~25 km-ish (approx)
} as const;

const ORIGIN: Axial = { q: 0, r: 0 };

function distKm(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function makeEvent(
  sol: number,
  title: string,
  kind: OpportunityEventKind,
  q: number,
  r: number,
  detail?: string
): OpportunityEvent {
  const cellId = hexId(q, r);
  const { xKm, yKm } = axialToKmPointy(q, r, OPPORTUNITY_DEMO_CONFIG.sizeKm);
  const kmFromOrigin = distKm(xKm, yKm);
  return {
    id: `SOL_${sol}_${cellId}`,
    sol,
    title,
    kind,
    detail,
    cellId,
    xKm,
    yKm,
    kmFromOrigin,
  };
}

export function buildOpportunityDemo(): OpportunityDemo {
  const { radiusRings, sizeKm } = OPPORTUNITY_DEMO_CONFIG;
  const cells = generateHexCells(radiusRings, sizeKm);

  // Demo "journal" milestones (titles are inspired by well-known Opportunity-era concepts,
  // but coordinates here are simplified for gameplay).
  const rawEvents: OpportunityEvent[] = [
    makeEvent(0, "Landing (Zero Day)", "landing", 0, 0, "Origin cell = landing site."),
    makeEvent(7, "First panorama stitched", "science", 1, 0),
    makeEvent(30, "Approach to a small crater", "drive", 2, -1),
    makeEvent(60, "Outcrop analysis", "science", 2, 0),
    makeEvent(120, "Long drive milestone", "milestone", 4, -2),
    makeEvent(180, "Dust storm incoming", "anomaly", 3, -1),
    makeEvent(250, "Crater rim arrival (demo landmark)", "milestone", 5, -3),
    makeEvent(310, "High-value mineral signature", "science", 6, 3),
    makeEvent(420, "Solar array cleaning event", "anomaly", 4, 1),
    makeEvent(520, "Farther traverse checkpoint", "drive", 7, -4),
  ];

  // Ensure all events land inside the generated radius.
  const events = rawEvents.filter((e) => {
    const parts = e.cellId.split("_");
    const q = Number(parts[1]);
    const r = Number(parts[2]);
    return axialDistance(ORIGIN, { q, r }) <= radiusRings;
  });

  const eventsByCell: Record<string, OpportunityEvent[]> = {};
  for (const e of events) (eventsByCell[e.cellId] ||= []).push(e);
  for (const k of Object.keys(eventsByCell))
    eventsByCell[k].sort((a, b) => a.sol - b.sol);

  events.sort((a, b) => a.sol - b.sol);
  return { radiusRings, sizeKm, cells, events, eventsByCell };
}
