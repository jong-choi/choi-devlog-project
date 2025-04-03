"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { Category, Post } from "@/types/post";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/ui/post-top-bar";
import SearchInput from "@/components/posts/infinite-scroll/search-input";
import { MobilePostSidebar } from "@/components/post/sidebar/mobile-post-sidebar";
import { SidebarCategoryContent } from "@/components/post/sidebar/sidebar-category-content";

export function Sidebar({
  inset = false,
  categories,
  posts,
}: {
  inset?: boolean;
  categories: Category[];
  posts: Post[];
}) {
  const {
    selectedSubcategoryId,
    selectedSubcategoryName,
    selectedPostId,
    leftCollapsed,
    rightCollapsed,
    setSubcategory,
    setLeftCollapsed,
    setRightCollapsed,
  } = useSidebarStore(useShallow((state) => state));

  return (
    <div
      className={cn(
        "inline-flex h-full bg-transparent backdrop-blur-sm transition-colors flex-col md:flex-row z-50",
        inset ?? "gap-4 p-4"
      )}
    >
      {/* 왼쪽 사이드바 */}
      <div
        className={cn(
          "hidden md:flex flex-col border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden",
          leftCollapsed ? "w-6 cursor-pointer" : "w-64",
          inset ??
            "rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
        )}
        onClick={() => {
          if (leftCollapsed) {
            setLeftCollapsed(false);
          }
        }}
      >
        <button
          className="absolute top-2 right-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md p-1 transition"
          onClick={() => {
            setLeftCollapsed(!leftCollapsed);
          }}
        >
          {leftCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 -mr-3" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {!leftCollapsed && (
          <div className="px-4 py-2 w-64 overflow-auto space-y-2">
            <div className="flex flex-col gap-2">
              <Logo />
              <SearchInput
                className="py-0 bg-glass-bg-20 shadow-none border h-6"
                withButton={false}
                onSidebar={true}
              />
            </div>
            <div className="border-t">
              {categories.map((cat) => (
                <SidebarCategoryContent
                  key={cat.id}
                  catagory={cat}
                  setRightCollapsed={setRightCollapsed}
                  setSubcategory={setSubcategory}
                  selectedSubcategoryId={selectedSubcategoryId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 오른쪽 사이드바 */}
      <div
        className={cn(
          "hidden md:flex flex-col border-x border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden",
          inset ?? "rounded-2xl shadow-sm border",
          rightCollapsed ? (inset ? "w-0 -ml-4" : "w-0 opacity-20") : "w-64"
        )}
      >
        {!rightCollapsed && (
          <div className="p-4 w-64 overflow-auto space-y-1 scrollbar flex flex-col">
            {selectedSubcategoryId ? (
              <>
                {selectedSubcategoryName && (
                  <div className="font-extralight px-3 select-none">
                    {selectedSubcategoryName}
                  </div>
                )}
                {posts
                  .filter(
                    (post) => post.subcategory_id === selectedSubcategoryId
                  )
                  .map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.url_slug}`}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300  transition",
                        selectedPostId === post.id
                          ? " text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                          : "text-gray-700 dark:text-gray-300 "
                      )}
                    >
                      {post.title}
                    </Link>
                  ))}
              </>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                서브 카테고리를 선택해주세요.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 🌟 모바일 사이드바 (왼쪽, 오른쪽 공통 컨테이너) */}
      <MobilePostSidebar posts={posts} categories={categories} />
    </div>
  );
}
