import OpportunityClient from "./OpportunityClient";
import { buildOpportunityDemo } from "@/lib/opportunityDemo";

export const dynamic = "force-static";

export default function OpportunityDemoPage() {
  const demo = buildOpportunityDemo();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="space-y-2">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">Opportunity / Hex Journal Demo</h1>
              <p className="text-sm text-neutral-600">
                Hex grid (N={demo.radiusRings}) with local “journal” events. Click a hex to inspect.
              </p>
            </div>
            <nav className="flex gap-3 text-sm">
              <a className="text-sky-700 underline" href="/v2/me">My Page</a>
              <a className="text-sky-700 underline" href="/v1/map">v1 Map</a>
            </nav>
          </div>
        </header>
        <OpportunityClient demo={demo} />
      </div>
    </main>
  );
}
