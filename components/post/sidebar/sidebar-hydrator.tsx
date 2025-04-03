"use client";

import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category, Subcategory } from "@/types/post";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

// 사이드바 상태를 주입
export default function SidebarHydrator({
  category,
  subcategory,
  postId,
}: {
  category: Category | null;
  subcategory: Subcategory | null;
  postId: string;
}) {
  const {
    setCategory,
    setSubcategory,
    setPost,
    setLeftCollapsed,
    setRightCollapsed,
    setOpenCategory,
  } = useSidebarStore(useShallow((state) => state));

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (hasMountedRef.current) return;
    if (!category || !subcategory) return;
    hasMountedRef.current = true;
    setCategory(category.id);
    setOpenCategory(category.id, true);
    setSubcategory({ id: subcategory.id, name: subcategory.name });
    setPost(postId);
    setLeftCollapsed(false);
    setRightCollapsed(false);
  }, [
    category,
    postId,
    setCategory,
    setLeftCollapsed,
    setOpenCategory,
    setPost,
    setRightCollapsed,
    setSubcategory,
    subcategory,
  ]);

  return null;
}
