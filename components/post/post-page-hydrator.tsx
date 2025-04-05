"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { hydrateFromSessionStorage } from "@/utils/persistState";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useShallow } from "zustand/react/shallow";

// 세션 스토리지 상태를 주입
export default function PostPageHydrator() {
  const { setIsSortable } = useSidebarStore(
    useShallow((state) => ({
      setIsSortable: state.setIsSortable,
    }))
  );

  const { setIsEditMode, setIsMarkdown, setIsRaw } = useAutosave(
    useShallow((state) => ({
      setIsEditMode: state.setIsEditMode,
      setIsMarkdown: state.setIsMarkdown,
      setIsRaw: state.setIsRaw,
    }))
  );

  useEffect(() => {
    hydrateFromSessionStorage("isSortable", setIsSortable);
    hydrateFromSessionStorage("isEditMode", setIsEditMode);
    hydrateFromSessionStorage("isMarkdownOn", setIsMarkdown);
    hydrateFromSessionStorage("isRawOn", setIsRaw);
  }, [setIsSortable, setIsEditMode, setIsMarkdown, setIsRaw]);

  return null;
}
