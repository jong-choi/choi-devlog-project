"use client";

import SidebarPenel from "@/components/post/sidebar/panels/sidebar-penel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";

export default function SidebarApp({ categories }: { categories: Category[] }) {
  const { selectedCategory, selectedSubcategory } = useSidebarStore(
    (state) => state
  );

  return (
    <div className="flex flex-col h-full">
      <SidebarPenel type="category" data={categories} />
      {selectedCategory && (
        <SidebarPenel
          type="subcategory"
          data={selectedCategory.subcategories}
        />
      )}
      {selectedSubcategory && (
        <SidebarPenel type="post" data={selectedSubcategory.posts} />
      )}
    </div>
  );
}
