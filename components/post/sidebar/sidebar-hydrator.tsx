"use client";

import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useEffect } from "react";

// 사이드바 상태를 주입
export default function SidebarHydrator() {
  const setIsSortable = useSidebarStore((state) => state.setIsSortable);

  useEffect(() => {
    const stored = sessionStorage.getItem("isSortable");
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      setIsSortable(parsed);
    }
  }, [setIsSortable]);

  return null;
}
