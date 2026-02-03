import Link from "next/link";

export default function HomePage() {
  const items = [
    { href: "/v1", label: "V1 Home" },
    { href: "/v1/join", label: "Join (Create Handle)" },
    { href: "/v1/map", label: "Map" },
    { href: "/v1/market", label: "Market" },
    { href: "/v1/me", label: "My Grids" },
    { href: "/v1/admin", label: "Admin" },
  ];

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px", fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Mars Grid Demo</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        入口ページです。まずは Join → Map → Market の順で確認してください。
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 24, display: "grid", gap: 12 }}>
        {items.map((it) => (
          <li key={it.href} style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 12, padding: 12 }}>
            <Link href={it.href} style={{ textDecoration: "none" }}>
              <span style={{ fontWeight: 700 }}>{it.label}</span>
              <span style={{ marginLeft: 10, opacity: 0.75 }}>{it.href}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
