import { redirect } from "next/navigation";

export default function Home() {
  // v2 を表玴関储につる（/v2/map )
  redirect("/v2/map");
}
