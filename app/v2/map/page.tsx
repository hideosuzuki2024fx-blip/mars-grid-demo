export const dynamic = "force-dynamic";

export default function V2MapPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">v2 Map (embedded v1)</h1>
            <p className="text-sm text-neutral-600">
              ませぬ v1/map をv2の表玟に变ࢸむ（炶态はそのまま石筗
            </p>
          </div>

          <nav className="flex gap-3 text-sm">
            <a className="text-sky-700 underline" href="/v2/me">My Page</a>
            <a className="text-sky-700 underline" href="/v2/opportunity">Opportunity</a>
            <a className="text-sky-700 underline" href="/v1/map">Open v1 directly</a>
          </nav>
        </header>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <iframe title="v1 map" src="/v1/map" className="w-full h-[78vh]" />
        </div>

        <div className="text-xs text-neutral-500">
          ∸  次のステップで、v2ネイティブ�I<に編㵗
        </div>
      </div>
    </main>
  );
}
