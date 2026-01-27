import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function V2MapPage() {
  // Temporary: v2 front-door to v1 map until v2-native map is ready.
  redirect("/v1/map");
}
