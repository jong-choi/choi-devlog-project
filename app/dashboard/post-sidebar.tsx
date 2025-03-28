"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SidebarState {
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  setCategory: (id: string | null) => void;
  setSubcategory: (id: string | null) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  setCategory: (id) =>
    set({ selectedCategoryId: id, selectedSubcategoryId: null }),
  setSubcategory: (id) => set({ selectedSubcategoryId: id }),
}));

const categories = [
  {
    id: "cat1",
    name: "프로그래밍",
    subcategories: [
      { id: "sub1", category_id: "cat1", name: "JavaScript" },
      { id: "sub2", category_id: "cat1", name: "Python" },
    ],
  },
  {
    id: "cat2",
    name: "디자인",
    subcategories: [
      { id: "sub3", category_id: "cat2", name: "UI/UX" },
      { id: "sub4", category_id: "cat2", name: "그래픽 디자인" },
    ],
  },
];

const posts = [
  {
    id: "post1",
    subcategory_id: "sub1",
    url_slug: "intro-js",
    title: "자바스크립트 입문",
  },
  {
    id: "post2",
    subcategory_id: "sub1",
    url_slug: "advanced-js",
    title: "자바스크립트 심화",
  },
  {
    id: "post3",
    subcategory_id: "sub2",
    url_slug: "python-basic",
    title: "파이썬 기초",
  },
  {
    id: "post4",
    subcategory_id: "sub3",
    url_slug: "uiux-intro",
    title: "UI/UX 디자인 소개",
  },
];

export function Sidebar() {
  const {
    selectedCategoryId,
    selectedSubcategoryId,
    setCategory,
    setSubcategory,
  } = useSidebarStore();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setCategory(categories[0].id);
    }
  }, [selectedCategoryId, setCategory]);

  return (
    <div className="inline-flex h-full gap-4 p-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* 왼쪽 사이드바 */}
      <div
        className={cn(
          "flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all duration-300 relative overflow-x-hidden",
          leftCollapsed ? "w-6" : "w-64"
        )}
      >
        <button
          className="absolute top-2 right-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-transparent rounded-md p-1 transition"
          onClick={() => setLeftCollapsed(!leftCollapsed)}
        >
          {leftCollapsed ? "→" : "←"}
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
          "flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all duration-300 relative overflow-x-hidden",
          rightCollapsed ? "w-0 -ml-4" : "w-80"
        )}
      >
        <button
          className="absolute top-2 left-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-transparent rounded-md p-1 transition"
          onClick={() => setRightCollapsed(!rightCollapsed)}
        >
          {rightCollapsed ? "←" : "→"}
        </button>

        {!rightCollapsed && (
          <div className="p-4 w-80 overflow-auto space-y-1">
            {selectedSubcategoryId ? (
              posts
                .filter((post) => post.subcategory_id === selectedSubcategoryId)
                .map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.url_slug}`}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
    </div>
  );
}

export function SidebarContent({
  catagory,
  setRightCollapsed,
  selectedSubcategoryId,
  setSubcategory,
}: {
  catagory: {
    id: string;
    name: string;
    subcategories: {
      id: string;
      category_id: string;
      name: string;
    }[];
  };
  setRightCollapsed: (state: boolean) => void;
  selectedSubcategoryId?: string | null;
  setSubcategory: (id: string | null) => void;
}) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div key={catagory.id}>
      <button
        onClick={() => setIsOpened((prev) => !prev)}
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
