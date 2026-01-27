"use client";

export default function HexMapClient() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-3">
        <h1 className="text-2xl font-semibold">v2 Map</h1>
        <p className="text-sm text-neutral-600">
          Hex UI is under construction. Use v1 map for now.
        </p>
        <a className="inline-block rounded-xl border px-4 py-2 hover:bg-neutral-50" href="/v1/map">
          Open v1 map
        </a>
      </div>
    </main>
  );
}
