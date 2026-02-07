import { Suspense } from "react";
import TradeMapClient from "@/app/_components/TradeMapClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TradeMapClient mode="v1" />
    </Suspense>
  );
}
