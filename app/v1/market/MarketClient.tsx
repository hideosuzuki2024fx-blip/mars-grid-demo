"use client";

import { useEffect, useMemo, useState } from "react";
import { useGridParam } from "../_shared/useGridParam";

type Listing = {
  id: string;
  grid_id: string;
  price: number;
  seller_handle: string;
};

export default function MarketPage() {
  const { gridId, setGridId: setGridParamId, clearGrid } = useGridParam();

  const [listings, setListings] = useState<Listing[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [price, setPrice] = useState(200);
  const [busy, setBusy] = useState(false);

  const selectedGridId = gridId || "";

  const selectedListing = useMemo(() => {
    if (!selectedGridId) return null;
    return listings.find((l) => l.grid_id === selectedGridId) ?? null;
  }, [listings, selectedGridId]);

  async function load() {
    setErr(null);
    const r = await fetch("/api/v1/market", { cache: "no-store" });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error ?? "MARKET_FAILED");
    setListings(j.listings);
  }

  useEffect(() => {
    load().catch((e: any) => setErr(e?.message ?? "MARKET_FAILED"));
  }, []);

  async function list() {
    if (!selectedGridId) {
      setErr("Grid ID を選択してください（Mapクリック or 一覧クリック）");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/v1/market/list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gridId: selectedGridId, price }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "LIST_FAILED");
      // keep selected grid in URL; avoids copy/paste loop
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
      constr = await fetch("/api/v1/market/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const k = await constr.json();
      if (!kk.ok) throw new Error(k.error ?? "BUY_FAILED");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "BUY_FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Market</h2>
        <div style={{ opacity: 0.85 }}>
          Selected: <b>{selectedGridId || "-"}</b>
        </div>
      </div>

      {err && <div style={{ color: "#ff6b6b", marginBottom: 10 }}>Error: {err}</div>}

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>出品する（コピペ不要）</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={selectedGridId}
            onChange={(e) => setGridParamId(e.target.value)}
            placeholder="Mapクリックで自動入力 / 例: G-00-00"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333", width: 260 }}
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
          <button
            onClick={clearGrid}
            disabled={busy || !selectedGridId}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer", opacity: selectedGridId ? 1 : 0.6 }}
          >
            Clear
          </button>
        </div>
        <div style={{ opacity: 0.85, marginTop: 8 }}>
          ※ 自分の所有区画で、未ロックのものだけ出品できます（出品中は locked になります）
        </div>

        {selectedListing && (
          <div style={{ marginTop: 10, padding: 10, border: "1px solid #222", borderRadius: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>選択中の出品状態</div>
            <div><b>FOR SALE</b>: {selectedListing.price} CX</div>
            <div><b>Seller</b>: {selectedListing.seller_handle}</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {listings.map((l) => {
          const isSel = selectedGridId === l.grid_id;
          return (
            <div
              key={l.id}
              onClick={() => setGridParamId(l.grid_id)}
              style={{
                border: isSel ? "2px solid #4AA3FF" : "1px solid #333",
                borderRadius: 12,
                padding: 12,
                cursor: "pointer",
              }}
              title="クリックで選択（URLの ?grid= を更新）"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{l.grid_id}</div>
                  <div style={{ opacity: 0.85 }}>seller: {l.seller_handle}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontWeight: 800 }}>{l.price} CX</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buy(l.id);
                    }}
                    disabled={busy}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {listings.length === 0 && (
        <div style={{ marginTop: 12, opacity: 0.85 }}>
          出品がまだありません。
        </div>
      )}
    </div>
  );
}



