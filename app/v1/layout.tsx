export default function V1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <a href="/v1" style={{ fontWeight: 800 }}>CosmoX /v1</a>
        <nav style={{ display: "flex", gap: 12 }}>
          <a href="/v1/join">Join</a>
          <a href="/v1/map">Map</a>
          <a href="/v1/me">My Grids</a>
          <a href="/v1/market">Market</a>
          <a href="/v1/admin">Admin</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
