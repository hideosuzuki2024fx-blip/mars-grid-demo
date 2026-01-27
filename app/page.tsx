import { redirect } from "next/navigation";

export default function Home() {
  // v2を表玄関にする（まずは /v2/map へ）
  redirect("/v2/map");
}
