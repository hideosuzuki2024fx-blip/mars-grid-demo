"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type MeResponse = {
  ok: boolean;
  user?: { handle: string; balance: number };
  grids?: any[];
  error?: string;
};

export default function TopBar() {
  const sp = useSearchParams();
  const embed = sp.get("embed") === "1";
  const qs = sp.toString();
  const href = (path: string) => (qs ? `${path}?${qs}` : path);
  const [me, setMe] = useState<MeResponse | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/v1/me", { cache: "no-store" });
      const j = (await r.json()) as MeResponse;
      setMe(j);
    } catch {
      setMe({ ok: false, error: "ME_FAILED" });
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000); // 11秒ご�
聙で自動更新
    return () => clearInterval(t);
  }, []);

  if (embed) return null;

  const joined = !!me?.ok && !!me?.user;
  const handle = joined ? me!.user!.handle : "-";
  const balance = joined ? me!.user!.balance : 0;
  const grids = joined ? (me!.grids?.length ?? 0) : 0;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#0d0d0d",
        borderBottom: "1px solid #222",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900 }}>CosmoX /v1</div>

          <div style={{ opacity: 0.9 }}>
            <b>Handle</b>: {handle}
          </div>
          <div style={{ opacity: 0.9 }}>
            <b>Balance</b>: {balance} CX
          </div>
          <div style={{ opacity: 0.9 }}>
            <b>Grids</b>: {grids}
          </div>

          {!joined && (
            <div style={{ opacity: 0.75 }}>
              未参加なら# <a href={href("/v1/join")}>Join</a>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a href={href("/v1/map")}>Map</a>
          <a href={href("/v1/me")}>My Grids</a>
          <a href={href("/v1/market")}>Market</a>
          <a href={href("/v1/admin")}>Admin</a>

          <button
            onClick={load}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #333",
              cursor: "pointer",
            }}
            title="キ諣髋・ゟ　提数を更新
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}