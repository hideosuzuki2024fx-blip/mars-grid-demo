export default function V2IndexPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">v2 Experiments</h1>
        <p className="text-sm text-neutral-600">Stable page to confirm deployment updates.</p>

        <ul className="space-y-2">
          <li>
            <a className="text-sky-700 underline" href="/v2/opportunity">
              Opportunity / Hex Journal Demo
            </a>
          </li>
          <li>
            <a className="text-sky-700 underline" href="/v2/me">
              My Page (Join / Resume / My grids)
            </a>
          </li>
          <li>
            <a className="text-sky-700 underline" href="/v1/map">
              v1 Map (trade/operations)
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
