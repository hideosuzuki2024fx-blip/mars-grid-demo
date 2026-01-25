import type { ReactNode } from "react";
import TopBar from "./_components/TopBar";

export default function V1Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <TopBar />
      <div style={{ padding: 14 }}>
        {children}
      </div>
    </div>
  );
}