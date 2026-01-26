"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OpportunityDemo } from "@/lib/opportunityDemo";
import OpportunityMap from "./OpportunityMap";

export default function OpportunityClient({ demo }: { demo: OpportunityDemo }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [cell, setCell] = useState(sp.get("cell") ?? "HEX_0_0");

  useEffect(() => setCell(sp.get("cell") ?? "HEX_0_0"), [sp]);

  useEffect(() => {
    const cur = sp.get("cell") ?? "HEX_0_0";
    if (cell === cur) return;
    const next = new URLSearchParams(sp.toString());
    next.set("cell", cell);
    router.replace(`?${next.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell]);

  const eventCellIds = useMemo(() => new Set(Object.keys(demo.eventsByCell)), [demo.eventsByCell]);
  const events = demo.eventsByCell[cell] || [];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_340px]">
      <section className="rounded-2xl border bg-white p3 shadow-sm">
        <div className="flex items-center justify-between gap-3 pb-2">
          <div className="text-sm text-neutral-700">
            Selected: <span className="font-mono">{cell}</span>
          </div>
          <div className="text-xs text-neutral-600">
            events <span className="font-mono">{events.length}</span>
          </div>
        </div>

        <OpportunityMap
          cells={demo.cells}
          sizeKm={demo.sizeKm}
          selected={cell}
          eventCellIds={eventCellIds}
          onSelect={setCell}
        />
      </section>

      <aside className="rounded-2xl border bg-white p4 shadow-sm">
        <h2 className="text-base font-semibold">Journal events</h2>

        {events.length ? (
          <ul className="mt-2 space-y-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-xl border bg-neutral-50 p-2">
                <div className="text-xs text-neutral-600">
                  Sol {e.sol} ÷ {e.kind}
                </div>
                <div className="font-medium">{e.title}</div>
                {e.detail ? <div className="text-xs text-neutral-600">{e.detail}</div> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">No events on this cell.</p>
        )}

        <h3 className="mt-4 text-sm font-semibold">Timeline (demo)</h3>
        <ol className="mt-2 max-h[40vh] space-y-1 overflow-auto text-xs text-neutral-700">
          {demo.events.map((e) => (
            <li key={e.id} className={e.cellId === cell ? "font-semibold" : ""}>
              Sol ${e}.sol}: ${e}.title
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
