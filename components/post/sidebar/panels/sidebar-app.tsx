"use client";

import SidebarPanel from "@/components/post/sidebar/panels/sidebar-panel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";

export default function SidebarApp() {
  const {
    categories,
    selectedCategory,
    selectedSubcategory,
    selectedPostsData,
    selectedPost,
    selectedRecommendedPosts,
  } = useSidebarStore(
    useShallow((state) => ({
      categories: state.categories,
      selectedCategory: state.selectedCategory,
      selectedSubcategory: state.selectedSubcategory,
      selectedPostsData: state.selectedPostsData,
      selectedPost: state.selectedPost,
      selectedRecommendedPosts: state.selectedRecommendedPosts,
    }))
  );
  return (
    <div className="flex flex-col flex-1 text-gray-700 dark:text-gray-300 text-xs text-shadow">
      <SidebarPanel type="category" data={categories} />
      {selectedCategory && (
        <SidebarPanel
          type="subcategory"
          data={selectedCategory.subcategories}
        />
      )}
      {selectedSubcategory && (
        <SidebarPanel type="post" data={selectedPostsData || []} />
      )}
      {selectedPost && selectedRecommendedPosts && (
        <SidebarPanel
          type="recommended"
          data={selectedRecommendedPosts || []}
        />
      )}
    </div>
  );
}
