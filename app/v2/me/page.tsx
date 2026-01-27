import MeClient from "./MeClient";

export const dynamic = "force-dynamic";

export default function MePage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">My Page</h1>
            <p className="text-sm text-neutral-600">Join / 継続ログイン / 自分のグリッド一覧</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <a className="text-sky-700 underline" href="/v2/opportunity">Opportunity</a>
            <a className="text-sky-700 underline" href="/v2">v2 Index</a>
          </nav>
        </header>
        <MeClient />
      </div>
    </main>
  );
}
