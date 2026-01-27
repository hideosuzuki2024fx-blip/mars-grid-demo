export default function V2IndexPage() {
  return (
    <main className="min-h-screen p4 md:p8">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">v2 Experiments</h1>
        <p className="text-sm text-neutral-600">Stable page to confirm deployment updates.</p>
        <ul className="space-y-2">
          <li>
            <a className="text-sky-700 underline" href="/v2/opportunity">
              Opportunity / Hex Journal Demo
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
