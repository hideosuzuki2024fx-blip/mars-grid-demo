"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: string;
  grid_id: string;
  price: number;
  seller_handle: string;
};

export default function MarketPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [gridId, setGridId] = useState("");
  const [price, setPrice] = useState(200);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    const r = await fetch("/api/v1/market");
    const j = await r.json();
    if (!j.ok) throw new Error(j.error ?? "MARKET_FAILED");
    setListings(j.listings);
  }

  useEffect(() => {
    load().catch((e: any) => setErr(e?.message ?? "MARKET_FAILED"));
  }, []);

  async function list() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/v1/market/list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gridId, price }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "LIST_FAILED");
      setGridId("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "LIST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function buy(listingId: string) {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/v1/market/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "BUY_FAILED");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "BUY_FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Market</h2>

      {err && <div style={{ color: "#ff6b6b", marginBottom: 10 }}>Error: {err}</div>}

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>出品する</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={gridId}
            onChange={(e) => setGridId(e.target.value)}
            placeholder="Grid ID 例: G-00-00"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", width: 220 }}
          />
          <input
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            type="number"
            min={1}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", width: 140 }}
          />
          <button
            onClick={list}
            disabled={busy}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
          >
            {busy ? "..." : "List"}
          </button>
        </div>
        <div style={{ opacity: 0.85, marginTop: 8 }}>
          ※ 自分の所有区画で、未ロックのものだけ出品できます（出品中は locked になります）
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {listings.map((l) => (
          <div key={l.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{l.grid_id}</div>
                <div style={{ opacity: 0.85 }}>seller: {l.seller_handle}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>{l.price} CX</div>
                <button
                  onClick={() => buy(l.id)}
                  disabled={busy}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div style={{ marginTop: 12, opacity: 0.85 }}>
          出品がまだありません。
        </div>
      )}
    </div>
  );
}
