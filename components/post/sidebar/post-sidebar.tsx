"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { Category, Post } from "@/types/post";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeftIcon,
  X,
} from "lucide-react";

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
    selectedPostId,
    leftCollapsed,
    rightCollapsed,
    mobileOpen,
    setSubcategory,
    setLeftCollapsed,
    setRightCollapsed,
    toggleMobileOpen,
  } = useSidebarStore(useShallow((state) => state));

  return (
    <div
      className={cn(
        "inline-flex h-full bg-gray-50 dark:bg-gray-950 transition-colors flex-col md:flex-row",
        inset ?? "gap-4 p-4"
      )}
    >
      {/* 왼쪽 사이드바 */}
      <div
        className={cn(
          "hidden md:flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden",
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
          className="absolute top-2 right-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-transparent rounded-md p-1 transition"
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
          <div className="p-4 w-64 overflow-auto space-y-2">
            {categories.map((cat) => (
              <SidebarContent
                key={cat.id}
                catagory={cat}
                setRightCollapsed={setRightCollapsed}
                setSubcategory={setSubcategory}
                selectedSubcategoryId={selectedSubcategoryId}
              />
            ))}
          </div>
        )}
      </div>
      {/* 오른쪽 사이드바 */}
      <div
        className={cn(
          "hidden md:flex flex-col bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden",
          inset ?? "rounded-2xl shadow-sm border",
          rightCollapsed ? (inset ? "w-0 -ml-4" : "w-0 opacity-20") : "w-64"
        )}
      >
        {!rightCollapsed && (
          <div className="p-4 w-64 overflow-auto space-y-1">
            {selectedSubcategoryId ? (
              posts
                .filter((post) => post.subcategory_id === selectedSubcategoryId)
                .map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.url_slug}`}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition",
                      selectedPostId === post.id
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {post.title}
                  </Link>
                ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                서브 카테고리를 선택해주세요.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 🌟 모바일 사이드바 (왼쪽, 오른쪽 공통 컨테이너) */}
      <div
        className={cn(
          "fixed md:hidden inset-y-0 left-0 bg-white dark:bg-gray-900 transition-transform duration-300 z-50 shadow-xl overflow-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-full pt-12 p-4" // padding-top 추가
        )}
      >
        {/* 🌟 닫기 버튼 한 번만 추가, 항상 우측상단에 고정 */}
        <button
          className="absolute top-3 right-3  text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition flex items-center gap-1"
          onClick={() => toggleMobileOpen()}
        >
          닫기 <X className="h-5 w-5" />
        </button>

        {/* 🌟 콘텐츠만 조건부 렌더링 */}
        {selectedSubcategoryId ? (
          <>
            <button
              className="mb-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 flex"
              onClick={() => setSubcategory(null)}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              목록보기
            </button>
            {posts
              .filter((post) => post.subcategory_id === selectedSubcategoryId)
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.url_slug}`}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition",
                    selectedPostId === post.id
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {post.title}
                </Link>
              ))}
          </>
        ) : (
          categories.map((cat) => (
            <SidebarContent
              key={cat.id}
              catagory={cat}
              setRightCollapsed={setRightCollapsed}
              setSubcategory={setSubcategory}
              selectedSubcategoryId={selectedSubcategoryId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function SidebarContent({
  catagory,
  setRightCollapsed,
  selectedSubcategoryId,
  setSubcategory,
}: {
  catagory: Category;
  setRightCollapsed: (state: boolean) => void;
  selectedSubcategoryId?: string | null;
  setSubcategory: (id: string | null) => void;
}) {
  const { isOpened, toggleCategory } = useSidebarStore(
    useShallow((state) => ({
      isOpened: state.openedCategories[catagory.id] || false,
      toggleCategory: state.toggleCategory,
    }))
  );

  return (
    <div key={catagory.id}>
      <button
        onClick={() => toggleCategory(catagory.id)}
        className="w-full text-left text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition"
      >
        {catagory.name}
      </button>
      {isOpened && (
        <div className="ml-2 mt-1 space-y-1">
          {catagory.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSubcategory(sub.id);
                setRightCollapsed(false);
              }}
              className={cn(
                "block w-full text-left px-4 py-1.5 text-sm rounded-md transition",
                selectedSubcategoryId === sub.id
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
