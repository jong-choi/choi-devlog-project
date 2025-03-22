"use client";

import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category, Subcategory } from "@/types/post";
import { useEffect, useRef } from "react";

// 사이드바 상태를 주입
export default function SidebarHydrator({
  category,
  subcategory,
}: {
  category: Category | null;
  subcategory: Subcategory | null;
}) {
  const hasMountedRef = useRef(false);

  const selectedCategory = useSidebarStore((state) => state.selectedCategory);
  const setSelectedCategory = useSidebarStore(
    (state) => state.setSelectedCategory
  );
  const setSelectedSubcategory = useSidebarStore(
    (state) => state.setSelectedSubcategory
  );
  const setSelectedPostsData = useSidebarStore(
    (state) => state.setSelectedPostsData
  );
  const setSelectedPanel = useSidebarStore((state) => state.setSelectedPanel);
  useEffect(() => {
    if (hasMountedRef.current) return;
    if (!category || !subcategory) return;
    hasMountedRef.current = true;
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  }, [
    hasMountedRef,
    category,
    subcategory,
    selectedCategory,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPostsData,
    setSelectedPanel,
  ]);

  return null;
}
