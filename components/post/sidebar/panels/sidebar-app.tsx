"use client";

import CreatePostButton from "@/components/post/sidebar/panels/create-post-button";
import SidebarPanel from "@/components/post/sidebar/panels/sidebar-panel";
import { useSidebarStore } from "@/providers/sidebar-store-provider";

export default function SidebarApp() {
  const {
    categories,
    selectedCategory,
    selectedSubcategory,
    selectedPostsData,
    selectedPost,
    selectedRecommendedPosts,
  } = useSidebarStore((state) => state);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full ">
      <CreatePostButton />
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
