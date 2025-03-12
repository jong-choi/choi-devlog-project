"use client";

import SidebarPenel from "@/components/post/sidebar/panels/sidebar-penel";
import { useSidebarStore } from "@/hooks/use-sidebar";
import { Category } from "@/types/post";

export default function PostSidebar({
  categories,
}: {
  categories: Category[];
}) {
  const { selectedCategory, selectedSubcategory } = useSidebarStore(
    (state) => state
  );

  return (
    <div className="flex flex-col h-full">
      <SidebarPenel type="category" data={categories} />
      {selectedCategory && (
        <SidebarPenel
          type="subcategory"
          data={categories[0].subcategories || []} // 첫 번째 카테고리의 서브카테고리 데이터
        />
      )}
      {selectedSubcategory && (
        <SidebarPenel
          type="post"
          data={categories[0].subcategories[0].posts || []} // 첫 번째 서브카테고리의 포스트 데이터
        />
      )}
    </div>
  );
}
