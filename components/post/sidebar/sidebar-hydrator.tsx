"use client";

import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category, Post, Subcategory } from "@/types/post";
import { useEffect } from "react";

// 사이드바 상태를 주입
export default function SidebarHydrator({
  category,
  subcategory,
  posts,
}: {
  category: Category | null;
  subcategory: Subcategory | null;
  posts: Post[] | null;
}) {
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
    if (!category || !subcategory) return;
    if (selectedCategory?.id === category.id) return;
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedPostsData(posts);
    if (posts?.length) {
      setSelectedPanel("post");
    } else {
      setSelectedPanel("subcategory");
    }
  }, [
    category,
    subcategory,
    selectedCategory,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedPostsData,
    posts,
    setSelectedPanel,
  ]);

  return null;
}
