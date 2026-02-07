import { Suspense } from "react";
import TradeMapClient from "@/app/_components/TradeMapClient";

export const dynamic = "force-dynamic";

export default function V2MapPage() {
  return (
    <Suspense fallback={null}>
      <TradeMapClient mode="v2" />
    </Suspense>
  );
}
