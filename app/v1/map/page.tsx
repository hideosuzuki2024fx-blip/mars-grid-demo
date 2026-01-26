import { Suspense } from "react";
import MapClient from "./MapClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MapClient />
    </Suspense>
  );
}
