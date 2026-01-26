import OpportunityClient from "./OpportunityClient";
import { buildOpportunityDemo } from "@/lib/opportunityDemo";

export const dynamic = "force-static";

export default function OpportunityDemoPage() {
  const demo = buildOpportunityDemo();

  return (
    <main className="min-h-screen p4 md:p8">
      <div className="mx-auto max-w-6xl space-y4">
        <header className="space-y1">
          <h1 className="text-2xl font-semibold">Opportunity / Hex Journal Demo</h1>
          <p className="text-sm text-neutral-600">
            Hex grid (N={demo.radiusRings}) with local “journal” events. Click a hex to inspect.
          </p>
        </header>

        <OpportunityClient demo={demo} />
      </div>
    </main>
  );
}
