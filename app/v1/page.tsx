export default function V1Home() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        CosmoX Grid Ownership Demo (v1)
      </h1>

      <p style={{ opacity: 0.9, marginBottom: 14 }}>
        参加（Join）→ 所有（Map/My Grids）→ 命名（My Grids）→ 取引（Market）までを、
        サーバー側の所有権で成立させる “最低限のゲーム土台” です。
      </p>

      <ol style={{ lineHeight: 1.8 }}>
        <li><b>Join</b> でユーザー名を登録</li>
        <li><b>Admin</b> でDB初期化 → ランダム配布</li>
        <li><b>Map</b> / <b>My Grids</b> で所有確認＆命名</li>
        <li><b>Market</b> で出品＆購入</li>
      </ol>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <a href="/v1/join">→ Joinへ</a>
        <a href="/v1/admin">→ Adminへ</a>
      </div>
    </div>
  );
}
