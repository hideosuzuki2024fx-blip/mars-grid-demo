import { Suspense } from "react";
import MarketClient from "./MarketClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketClient />
    </Suspense>
  );
}
