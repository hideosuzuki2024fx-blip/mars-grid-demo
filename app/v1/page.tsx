export default function V1Home() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        CosmoX Grid Ownership Demo (v1)
      </h1>

      <p style={{ opacity: 0.9, marginBottom: 14, lineHeight: 1.7 }}>
        v1 は長方形グリッドのデモです。初回は Join を行い、
        <b> My Grids（/v1/me）をブックマーク</b> しておくと、
        いつでも手軽に操作できます。
        <br />
        ※ Join は同じ handle で再実行できます（上書きではなくログイン扱いです）。
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <a href="/v1/join">→ Join / Login</a>
        <a href="/v1/me">→ My Grids</a>
        <a href="/v1/map">→ Map</a>
        <a href="/v1/market">→ Market</a>
        <a href="/v1/admin">→ Admin</a>
      </div>
    </div>
  );
}
