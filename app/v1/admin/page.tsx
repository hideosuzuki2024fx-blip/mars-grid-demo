"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [seed, setSeed] = useState("launch-001");
  const [perUser, setPerUser] = useState(3);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem("cx_admin_key") ?? "";
    setKey(k);
  }, []);

  function persist(v: string) {
    setKey(v);
    localStorage.setItem("cx_admin_key", v);
  }

  function errorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  }

  async function loadDevKey() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/v1/admin/dev-key", { cache: "no-store" });
      const j = (await r.json()) as { ok: boolean; key?: string; error?: string };
      if (!j.ok || !j.key) throw new Error(j.error ?? "DEV_KEY_FAILED");
      persist(j.key);
      setMsg("Dev key loaded from server env (local development only).");
    } catch (error: unknown) {
      setMsg("Error: " + errorMessage(error, "DEV_KEY_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  async function call(path: string, body: Record<string, unknown>) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-key": key },
        body: JSON.stringify(body ?? {}),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "ADMIN_FAILED");
      setMsg(JSON.stringify(j, null, 2));
    } catch (error: unknown) {
      setMsg("Error: " + errorMessage(error, "ADMIN_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Admin</h2>

      <p style={{ opacity: 0.9 }}>
        DB初期化とランダム配布です。<b>管理キー</b>が必要です（環境変数 CX_ADMIN_KEY）。
      </p>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Admin Key</div>
          <input
            value={key}
            onChange={(e) => persist(e.target.value)}
            placeholder="cx_admin_..."
            type={showKey ? "text" : "password"}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #333" }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowKey((v) => !v)}
              disabled={busy}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #333", cursor: "pointer" }}
            >
              {showKey ? "Hide key" : "Show key"}
            </button>
            <button
              onClick={() => void loadDevKey()}
              disabled={busy}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #333", cursor: "pointer" }}
            >
              Load dev key
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => call("/api/v1/admin/init", {})}
            disabled={busy}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
          >
            Init DB
          </button>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="seed"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #333", width: 220 }}
            />
            <input
              value={perUser}
              onChange={(e) => setPerUser(Number(e.target.value))}
              type="number"
              min={1}
              max={10}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #333", width: 120 }}
            />
            <button
              onClick={() => call("/api/v1/admin/allocate", { seed, perUser })}
              disabled={busy}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
            >
              Allocate
            </button>
          </div>
        </div>

        {msg && (
          <pre style={{ marginTop: 10, padding: 12, borderRadius: 12, border: "1px solid #333", whiteSpace: "pre-wrap" }}>
            {msg}
          </pre>
        )}

        <div style={{ marginTop: 10, opacity: 0.85 }}>
          ローカルの .env.local に管理キーを自動作成しました。Vercel本番でも同じキーを環境変数に設定すると使えます。
        </div>
      </div>
    </div>
  );
}
