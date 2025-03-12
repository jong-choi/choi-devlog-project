"use client";

import SidebarPenel from "@/components/post/sidebar/panels/sidebar-penel";
import { useSidebarStore } from "@/hooks/use-sidebar";
import { Category } from "@/types/post";

const categoriesData: Category[] = [
  {
    id: 1,
    name: "프론트엔드",
    subcategories: [
      {
        id: 101,
        name: "React",
        posts: [
          { id: 1001, name: "React 기초" },
          { id: 1002, name: "Hooks 완전 정복" },
        ],
      },
      {
        id: 102,
        name: "Vue",
        posts: [{ id: 1003, name: "Vue 3 소개" }],
      },
    ],
  },
  {
    id: 2,
    name: "백엔드",
    subcategories: [
      {
        id: 201,
        name: "Node.js",
        posts: [{ id: 2001, name: "Express.js 가이드" }],
      },
    ],
  },
];

export default function PostSidebar() {
  const { selectedCategory, selectedSubcategory } = useSidebarStore(
    (state) => state
  );

  const categories = categoriesData;

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
