"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OpportunityDemo } from "@/lib/opportunityDemo";

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

  const events = demo.eventsByCell[cell] ?? [];

  return (
    <main className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">Opportunity Demo (v2)</h1>
      <div className="flex items-center gap-2 text-sm">
        <span>cell</span>
        <input
          className="border rounded px-2 py-1 font-mono text-xs w-44"
          value={cell}
          onChange={(e) => setCell(e.target.value)}
        />
        <span className="text-neutral-600 text-xs">events {events.length}</span>
      </div>
      <pre className="text-xs bg-neutral-50 border rounded p-3 overflow-auto max-h-[60vh]">
        {JSON.stringify(events.slice(0, 20), null, 2)]}
      </pre>
      <p className="text-xs text-neutral-600">MVP. Next: hex map rendering.</p>
    </main>
  );
}
