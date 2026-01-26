"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

type NavItem = { href: string; label: string; preserveGrid?: boolean };

export function Nav() {
  const sp = useSearchParams();
  const embed = sp.get("embed") === "1";
  if (embed) return null;

  const grid = sp.get("grid") ?? "";

  const items: NavItem[] = [
    { href: "/v1", label: "Home", preserveGrid: true },
    { href: "/v1/map", label: "Map", preserveGrid: true },
    { href: "/v1/market", label: "Market", preserveGrid: true },
    { href: "/v1/me", label: "Me", preserveGrid: true },
    { href: "/v1/join", label: "Join", preserveGrid: false },
    { href: "/v1/admin", label: "Admin", preserveGrid: false },
  ];

  function withGrid(href: string, preserveGrid?: boolean) {
    if (!preserveGrid || !grid) return href;
    const [path, query] = href.split("?");
    const p = new URLSearchParams(query ?? "");
    p.set("grid", grid);
    const qs = p.toString();
    return qs ? `${path}?${qs}` : path;
  }

  const wrapStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    background: "#0d0d0d", // to keep dark theme
    border: "1px solid #222",
    boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
  };

  const baseItemStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #333",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 900,
    cursor: "pointer",
    background: "#111",
    color: "#f7d94c",
    lineHeight: 1.1,
    userSelect: "none",
  };

  function NavLink({ href, label }: { href: string; label: string }) {
    const [hover, setHover] = useState(false);
    const style: React.CSSProperties = hover
      ? { ...baseItemStyle, border: "1px solid #f7d94c", background: "#161616" }
      : baseItemStyle;

    return (
      <a
        href={href}
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {label}
      </a>
    );
  }

  return (
    <div style={wrapStyle}>
      {items.map((it) => (
        <NavLink
          key={it.href}
          href={withGrid(it.href, it.preserveGrid)}
          label={it.label}
        />
      ))}
    </div>
  );
}
