export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Mars Grid Demo</h1>
      <p style={{ opacity: 0.9, marginBottom: 18, lineHeight: 1.7 }}>
        表环メイン（/）です。推奐は v2（Opportunity / Hex)。v1 は旧デモとして残しています。
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <a href="/v2/opportunity" style={{ padding: 14, border: "1px solid #333", borderRadius: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>→→ v2（Recommended)</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>Hex�40リッド / Opportunity ジャーナルデモ</div>
        </a>

        <a href="/v1" style={{ padding: 14, border: "1px solid #333", borderRadius: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>→→ v1（Legacy)</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>四览グリッド / トレード妃曠表示ツモのツモ/8/div>
        </a>

        <a href="/v1/me" style={{ padding: 14, border: "1px solid #333", borderRadius: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>→→ v1 / me</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>複分のグリッド管理（ログインジ済みならこでとこえ//ここ）</div>
        </a>
      </div>

      <hr style={{ margin: "22px 0", opacity: 0.2 }} />

      <p style={{ opacity: 0.8, fontSize: 13 }}>
        NOTE: v1 の Join は同す �handle を指いて冠行すると『ログイン」所いとなります。
      </p>
    </main>
  );
}
