"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URLの ?grid= を「選択中Grid」の単一ソースにするフック。
 * - gridId: 現在の選択ID（未選択なら ""）
 * - setGridId: URLクエリを書き換えて選択を更新
 * - clearGrid: 選択解除
 */
export function useGridParam() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const gridId = useMemo(() => sp.get("grid") ?? "", [sp]);

  const setGridId = useCallback(
    (id: string) => {
      const p = new URLSearchParams(sp.toString());
      if (id && id.trim().length > 0) p.set("grid", id.trim());
      else p.delete("grid");
      router.replace(`${pathname}?${p.toString()}`);
    },
    [sp, router, pathname]
  );

  const clearGrid = useCallback(() => {
    const p = new URLSearchParams(sp.toString());
    p.delete("grid");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [sp, router, pathname]);

  return { gridId, setGridId, clearGrid };
}
