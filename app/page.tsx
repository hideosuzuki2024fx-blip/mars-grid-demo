import { redirect } from "next/navigation";

export default function Home() {
  // v2 を表玄関にする（デモは /v2/opportunity を起点に進める）
  redirect("/v2/opportunity");
}
