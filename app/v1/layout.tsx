import type { ReactNode } from "react";
import { Nav } from "./_shared/Nav";

export default function V1Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: 12 }}>
      <Nav />
      {children}
    </div>
  );
}
