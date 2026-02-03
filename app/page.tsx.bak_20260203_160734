"use client";

import React, { useMemo, useState } from "react";

type GridCell = {
  gridId: string;
  name: string;
  owner: string;
  r: number;
  c: number;
};

type EventType = "LANDING" | "DRILLING" | "DISCOVERY" | "STORM";

type GridEvent = {
  id: string;
  ts: string; // ISO
  type: EventType;
  gridId: string;
  message: string;
};

function isoNow() {
  return new Date().toISOString();
}

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default function Page() {
  const rows = 10;
  const cols = 20;

  const grid = useMemo<GridCell[]>(() => {
    const cells: GridCell[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gridId = `GRID-${String(r).padStart(2, "0")}-${String(c).padStart(2, "0")}`;
        cells.push({
          gridId,
          name: `Sector ${r}-${c}`,
          owner: `0x${(r * 997 + c * 31337 + 0xabc).toString(16).padStart(8, "0")}…`,
          r,
          c,
        });
      }
    }
    return cells;
  }, []);

  const [selected, setSelected] = useState<GridCell | null>(null);
  const [events, setEvents] = useState<GridEvent[]>([]);
  const [hotGridId, setHotGridId] = useState<string | null>(null);

  const fireEvent = (type: EventType) => {
    const cell = grid[Math.floor(Math.random() * grid.length)];
    const ev: GridEvent = {
      id: uid(),
      ts: isoNow(),
      type,
      gridId: cell.gridId,
      message:
        type === "LANDING"
          ? "Touchdown confirmed."
          : type === "DRILLING"
          ? "Drilling operation started."
          : type === "DISCOVERY"
          ? "Notable sample detected."
          : "Storm activity recorded.",
    };

    setEvents((prev) => [ev, ...prev].slice(0, 30));
    setHotGridId(cell.gridId);
    setTimeout(() => setHotGridId((cur) => (cur === cell.gridId ? null : cur)), 2500);
  };

  const selectedEvents = selected ? events.filter((e) => e.gridId === selected.gridId) : [];

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4">
          <div className="text-2xl font-semibold">Moon/Mars Grid Naming Demo</div>
          <div className="text-sm text-zinc-400">
            Concept MVP: Grid IDs + Official Updates Feed + Owner Experience (no blockchain in this demo)
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm hover:bg-zinc-800"
                onClick={() => fireEvent("LANDING")}
              >
                Simulate LANDING
              </button>
              <button
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm hover:bg-zinc-800"
                onClick={() => fireEvent("DRILLING")}
              >
                Simulate DRILLING
              </button>
              <button
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm hover:bg-zinc-800"
                onClick={() => fireEvent("DISCOVERY")}
              >
                Simulate DISCOVERY
              </button>
              <button
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm hover:bg-zinc-800"
                onClick={() => fireEvent("STORM")}
              >
                Simulate STORM
              </button>
              <div className="ml-auto text-xs text-zinc-500">
                Click a cell to see Grid ID / Name / Owner
              </div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-black p-2">
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((cell) => {
                  const isHot = hotGridId === cell.gridId;
                  const isSel = selected?.gridId === cell.gridId;
                  return (
                    <button
                      key={cell.gridId}
                      onClick={() => setSelected(cell)}
                      className={[
                        "aspect-square rounded-[2px] border",
                        isHot
                          ? "border-yellow-400 bg-yellow-400/30"
                          : isSel
                          ? "border-zinc-200 bg-zinc-700/30"
                          : "border-zinc-900 bg-zinc-950 hover:bg-zinc-900",
                      ].join(" ")}
                      title={`${cell.gridId} / ${cell.name} / ${cell.owner}`}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <div className="mb-2 text-sm font-semibold">Selected Grid</div>
              {selected ? (
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-zinc-400">Grid ID:</span> {selected.gridId}
                  </div>
                  <div>
                    <span className="text-zinc-400">Name:</span> {selected.name}
                  </div>
                  <div>
                    <span className="text-zinc-400">Owner:</span> {selected.owner}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Events on this grid: {selectedEvents.length}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-zinc-400">No grid selected.</div>
              )}
            </section>

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <div className="mb-2 text-sm font-semibold">Official Updates Feed</div>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {events.length === 0 ? (
                  <div className="text-sm text-zinc-400">
                    No events yet. Click “Simulate …”.
                  </div>
                ) : (
                  events.map((e) => (
                    <div key={e.id} className="rounded-md border border-zinc-800 bg-black px-2 py-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <div>{e.type}</div>
                        <div>{new Date(e.ts).toLocaleString()}</div>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-zinc-400">{e.gridId}</span> — {e.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
