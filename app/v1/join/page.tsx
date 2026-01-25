"use client";

import { useState } from "react";

export default function JoinPage() {
  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/v1/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "JOIN_FAILED");
      location.href = "/v1/me";
    } catch (e: any) {
      setMsg(e?.message ?? "JOIN_FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Join</h2>
      <p style={{ opacity: 0.9, marginBottom: 10 }}>
        ユーザー名を登録します（Cookieでセッション保持）。
      </p>

      <input
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="例: MaoGon"
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #333",
          marginBottom: 10,
        }}
      />

      <button
        onClick={join}
        disabled={busy}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #333",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Joining..." : "Join"}
      </button>

      {msg && (
        <div style={{ marginTop: 12, color: "#ff6b6b" }}>
          Error: {msg}
        </div>
      )}
    </div>
  );
}
