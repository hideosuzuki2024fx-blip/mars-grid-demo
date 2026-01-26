"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URLの ?grid= を「選択中Grid」の唯一のソースにしたいが、
 * next/navigation の searchParams が router.replace() 直後に一瞬“古い値”へ戻ることがあり、
 * Map側で選択がフリック（別IDに入れ替わる）することがある。
 *
 * 対策: gridId をローカル state で“楽観的”に更新し、searchParams とは同期する。
 */
export function useGridParam() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // optimistic local state (prevents flicker)
  const [gridId, setGridIdState] = useState<string>(() => sp.get("grid") ?? "");

  // sync when URL actually changes (back/forward, external nav, etc.)
  useEffect(() => {
    setGridIdState(sp.get("grid") ?? "");
  }, [sp]);

  const setGridId = useCallback(
    (id: string) => {
      const next = (id ?? "").trim();
      setGridIdState(next);

      const p = new URLSearchParams(sp.toString());
      if (next.length > 0) p.set("grid", next);
      else p.delete("grid");
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [sp, router, pathname]
  );

  const clearGrid = useCallback(() => {
    setGridIdState("");
    const p = new URLSearchParams(sp.toString());
    p.delete("grid");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [sp, router, pathname]);

  return { gridId, setGridId, clearGrid };
}
