"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { hydrateFromSessionStorage } from "@/utils/persistState";
import { useAutosave } from "@/providers/autosave-store-provider";

// 세션 스토리지 상태를 주입
export default function PostPageHydrator() {
  const setIsSortable = useSidebarStore((state) => state.setIsSortable);
  const setIsEditMode = useAutosave((state) => state.setIsEditMode);
  const setIsMarkdown = useAutosave((state) => state.setIsMarkdown);
  const setIsRaw = useAutosave((state) => state.setIsRaw);

  useEffect(() => {
    hydrateFromSessionStorage("isSortable", setIsSortable);
    hydrateFromSessionStorage("isEditMode", setIsEditMode);
    hydrateFromSessionStorage("isMarkdownOn", setIsMarkdown);
    hydrateFromSessionStorage("isRawOn", setIsRaw);
  }, [setIsSortable, setIsEditMode, setIsMarkdown, setIsRaw]);

  return null;
}
