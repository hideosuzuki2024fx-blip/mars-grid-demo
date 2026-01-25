"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

type NavItem = { href: string; label: string };

export function Nav() {
  const sp = useSearchParams();
  const embed = sp.get("embed") === "1";
  if (embed) return null;

  const items: NavItem[] = [
    { href: "/v1", label: "Home" },
    { href: "/v1/map", label: "Map" },
    { href: "/v1/market", label: "Market" },
    { href: "/v1/me", label: "Me" },
    { href: "/v1/join", label: "Join" },
    { href: "/v1/admin", label: "Admin" },
  ];

  const wrapStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    background: "#0d0d0d",           // 背景を強制（ページ背景に依存しない）
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
    background: "#111",              // ボタン背景も強制
    color: "#f7d94c",                // 文字色（IPPON-yellow系で高コントラスト）
    lineHeight: 1.1,
    userSelect: "none",
  };

  function NavLink({ href, label }: NavItem) {
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
        <NavLink key={it.href} href={it.href} label={it.label} />
      ))}
    </div>
  );
}
