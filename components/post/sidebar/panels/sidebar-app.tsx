"use client";

import SidebarPanel from "@/components/post/sidebar/panels/sidebar-panel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";

export default function SidebarApp({ categories }: { categories: Category[] }) {
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
      {selectedSubcategory && (
        <SidebarPanel type="post" data={selectedSubcategory.posts} />
      )}
    </div>
  );
}
