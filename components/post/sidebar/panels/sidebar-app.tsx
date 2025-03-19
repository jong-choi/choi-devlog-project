"use client";

import SidebarPanel from "@/components/post/sidebar/panels/sidebar-panel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category, Post } from "@/types/post";

export default function SidebarApp({
  categories,
  posts,
}: {
  categories: Category[];
  posts: Post[];
}) {
  const { selectedCategory, selectedSubcategory } = useSidebarStore(
    (state) => state
  );

  return (
    <div className="flex flex-col h-full">
      <SidebarPanel type="category" data={categories} />
      {selectedCategory && (
        <SidebarPanel
          type="subcategory"
          data={selectedCategory.subcategories}
        />
      )}
      {selectedSubcategory && <SidebarPanel type="post" data={posts} />}
    </div>
  );
}
