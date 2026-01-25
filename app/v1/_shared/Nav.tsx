"use client";

import { useSearchParams } from "next/navigation";

export function Nav() {
  const sp = useSearchParams();
  const embed = sp.get("embed") === "1";
  if (embed) return null;

  const itemStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #333",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 800,
    cursor: "pointer",
    color: "white",
  };

  const wrapStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #222",
  };

  return (
    <div style={wrapStyle}>
      <a href="/v1" style={itemStyle}>Home</a>
      <a href="/v1/map" style={itemStyle}>Map</a>
      <a href="/v1/market" style={itemStyle}>Market</a>
      <a href="/v1/me" style={itemStyle}>Me</a>
      <a href="/v1/join" style={itemStyle}>Join</a>
      <a href="/v1/admin" style={itemStyle}>Admin</a>
    </div>
  );
}
