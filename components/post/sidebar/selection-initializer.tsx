"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSidebarStore } from "@/providers/sidebar-store-provider";

type Selection = {
  selectedPostId: string | null;
  selectedCategoryId: string | null;
  selectedSubcategory: { id: string; name: string } | null;
  openCategoryId: string | null;
};

export default function SelectionInitializer({
  selection,
}: {
  selection: Selection;
}) {
  const setCategory = useSidebarStore((state) => state.setCategory);
  const setSubcategory = useSidebarStore((state) => state.setSubcategory);
  const setPost = useSidebarStore((state) => state.setPost);
  const setOpenCategory = useSidebarStore((state) => state.setOpenCategory);
  const setLoaded = useSidebarStore((state) => state.setLoaded);

  const current = useSidebarStore(
    useShallow((state) => ({
      selectedPostId: state.selectedPostId,
      selectedCategoryId: state.selectedCategoryId,
      selectedSubcategoryId: state.selectedSubcategoryId,
      openedCategories: state.openedCategories,
    })),
  );

  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;

    const currentOpen =
      current.openedCategories[selection.openCategoryId || ""];
    const isSame =
      current.selectedPostId === selection.selectedPostId &&
      current.selectedCategoryId === selection.selectedCategoryId &&
      current.selectedSubcategoryId === selection.selectedSubcategory?.id &&
      (!!currentOpen || selection.openCategoryId == null);

    if (!isSame) {
      setCategory(selection.selectedCategoryId);
      setSubcategory(selection.selectedSubcategory);
      setPost(selection.selectedPostId);
      if (selection.openCategoryId) {
        setOpenCategory(selection.openCategoryId, true);
      }
      setLoaded();
    }

    appliedRef.current = true;
  }, [
    current.openedCategories,
    current.selectedCategoryId,
    current.selectedPostId,
    current.selectedSubcategoryId,
    selection.openCategoryId,
    selection.selectedCategoryId,
    selection.selectedPostId,
    selection.selectedSubcategory,
    setCategory,
    setOpenCategory,
    setPost,
    setSubcategory,
    setLoaded,
  ]);

  return null;
}
