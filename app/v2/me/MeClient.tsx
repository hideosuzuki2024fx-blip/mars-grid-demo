"use client";

import { useEffect, useState } from "react";

type MeUser = { id: string; handle: string; balance: number };
type MeGrid = { id: string; r: number; c: number; name: string | null; locked: boolean };

type MeResponse =
  | { ok: true; user: MeUser; grids: MeGrid[] }
  | { ok: false; error: string };

export default function MeClient() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/v1/me", { cache: "no-store" });
      const j = (await r.json()) as MeResponse;
      setMe(j);
    } catch (e: any) {
      setMe({ ok: false, error: e?.message ?? "ME_FAILED" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function join() {
    const h = handle.trim();
    if (!h) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/v1/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: h }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "JOIN_FAILED");
      setMsg("JOIN完了。Cookieを保存したので、次回もこのページから再開できます。");
      setHandle("");
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "JOIN_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="text-sm text-neutral-600">loading...</div>;

  if (!me || me.ok === false) {
    const err = me?.ok === false ? me.error : "ME_FAILED";
    const notJoined = err === "NOT_JOINED" || err === "USER_NOT_FOUND";
    return (
      <div className="space-y-4">
        {notJoined ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
            <div className="text-base font-semibold">Join（初回登録）</div>
            <p className="text-sm text-neutral-600">ハンドル登録でCookieにUID保存。次回も同じブラウザなら再開できます。</p>
            <div className="flex gap-2">
              <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="handle" className="w-full rounded-xl border px-3 py-2 text-sm" />
              <button onClick={join} disabled={busy || !handle.trim()} className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60">{busy ? "..." : "Join"}</button>
            </div>
            {msg ? <div className="text-xs text-neutral-700">{msg}</div> : null}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="font-semibold">Error</div>
            <div className="text-sm text-neutral-600">{err}</div>
            <button onClick={load} className="mt-3 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">Retry</button>
          </div>
        )}
      </div>
    );
  }

  const user = me.user;
  const grids = me.grids ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-neutral-500">Handle</div>
            <div className="text-lg font-semibold">{user.handle}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Balance</div>
            <div className="text-lg font-semibold">{user.balance} CX</div>
          </div>
          <div className="flex gap-2">
            <a className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50" href="/v2/opportunity">Opportunity</a>
            <a className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50" href="/v1/map">v1 Map</a>
          </div>
        </div>
        {msg ? <div className="mt-3 text-xs text-neutral-700">{msg}</div> : null}
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <div className="text-base font-semibold">My Grids</div>
          <div className="text-xs text-neutral-600">{grids.length} grids</div>
        </div>

        {grids.length ? (
          <ul className="mt-3 grid gap-2">
            {grids.map((g) => (
              <li key={g.id} className="rounded-xl border bg-neutral-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-sm">{g.id}</div>
                    <div className="text-xs text-neutral-600">r:{g.r} c:{g.c}{g.locked ? " / LOCKED" : ""}{g.name ? ` / ${g.name}` : ""}</div>
                  </div>
                  <a className="rounded-xl border bg-white px-3 py-2 text-xs hover:bg-neutral-50" href={`/v1/map?grid=${encodeURIComponent(g.id)}`}>Open</a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-neutral-600">まだグリッドを持っていません。</p>
        )}
      </div>
    </div>
  );
}
