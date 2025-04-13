"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { Lock, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/ui/post-top-bar";
import SearchInput from "@/components/posts/infinite-scroll/search-input";
import { MobilePostSidebar } from "@/components/post/sidebar/mobile-post-sidebar";
import { SidebarCategoryContent } from "@/components/post/sidebar/sidebar-category-content";
import { WithSortableList } from "@/components/post/sortable-list/with-sortable-list";
import { WithSortableItem } from "@/components/post/sortable-list/with-sortable-item";
import ToggleSortableButton from "@/components/post/sortable-list/toggle-sortable-button";

import { useLayoutStore } from "@/providers/layout-store-provider";
import { SidebarSkeleton } from "@/components/post/sidebar/sidebar-skelton";
import { LinkLoader } from "@ui/route-loader";
import { useEffect } from "react";
import { CreateDialog } from "@/components/dialogs/create-dialog/create-dialog";

import CategoryCreateForm from "@/components/dialogs/create-forms/category-create-form";
import PostUpdateForm from "@/components/dialogs/update-forms/post-update-form";
import { SidebarContentDropdown } from "@/components/dialogs/sidebar-content-dropdown/sidebar-content-dropdown";

export function Sidebar({ inset = false }: { inset?: boolean }) {
  const {
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    setSidebarLeftCollapsed,
    setSidebarRightCollapsed,
  } = useLayoutStore(
    useShallow((state) => ({
      sidebarLeftCollapsed: state.sidebarLeftCollapsed,
      sidebarRightCollapsed: state.sidebarRightCollapsed,
      setSidebarLeftCollapsed: state.setSidebarLeftCollapsed,
      setSidebarRightCollapsed: state.setSidebarRightCollapsed,
    }))
  );

  const {
    posts,
    categories,
    selectedSubcategoryId,
    selectedSubcategoryName,
    selectedPostId,
    setSubcategory,
    loading,
  } = useSidebarStore(
    useShallow((state) => ({
      posts: state.posts || [],
      categories: state.categories || [],
      selectedSubcategoryId: state.selectedSubcategoryId,
      selectedSubcategoryName: state.selectedSubcategoryName,
      selectedPostId: state.selectedPostId,
      setSubcategory: state.setSubcategory,
      loading: state.loading,
    }))
  );
  useEffect(() => {}, [posts.length]);

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
          "hidden md:flex flex-col border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden ",
          sidebarLeftCollapsed ? "w-6 cursor-pointer" : "w-64",
          inset ??
            "rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
        )}
        onClick={() => {
          if (sidebarLeftCollapsed) {
            setSidebarLeftCollapsed(false);
          }
        }}
      >
        <button
          className="absolute top-2 right-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md p-1 transition"
          onClick={() => {
            setSidebarLeftCollapsed(!sidebarLeftCollapsed);
          }}
        >
          {sidebarLeftCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 -mr-3" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {!sidebarLeftCollapsed && (
          <div className="px-4 py-2 w-64 overflow-auto space-y-2 scrollbar">
            <div className="flex flex-col gap-2">
              <div className="flex h-full max-w-32">
                <Logo />
              </div>
              <SearchInput
                className="py-0 bg-glass-bg-20 shadow-none border h-6"
                withButton={false}
                onSidebar={true}
              />
            </div>

            <div className="border-t pt-1">
              <div className="flex w-full justify-between">
                <CreateDialog title={"분류"}>
                  {({ onClose }) => <CategoryCreateForm onClose={onClose} />}
                </CreateDialog>
                <ToggleSortableButton />
              </div>
              {loading ? (
                <SidebarSkeleton />
              ) : (
                <WithSortableList items={categories}>
                  {(categories) =>
                    categories.map((cat) => (
                      <SidebarCategoryContent
                        key={cat.id}
                        catagory={cat}
                        setSidebarRightCollapsed={setSidebarRightCollapsed}
                        setSubcategory={setSubcategory}
                        selectedSubcategoryId={selectedSubcategoryId}
                      />
                    ))
                  }
                </WithSortableList>
              )}
            </div>
          </div>
        )}
      </div>
      {/* 오른쪽 사이드바 */}
      <div
        className={cn(
          "hidden md:flex flex-col border-x border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden",
          inset ?? "rounded-2xl shadow-sm border",
          sidebarRightCollapsed
            ? inset
              ? "w-0 -ml-4"
              : "w-0 opacity-20"
            : "w-64"
        )}
      >
        {!sidebarRightCollapsed && (
          <div className="p-4 w-64 overflow-auto space-y-1 scrollbar flex flex-col">
            {!selectedSubcategoryId && loading && <SidebarSkeleton />}
            {!selectedSubcategoryId && !loading && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                서브 카테고리를 선택해주세요.
              </p>
            )}
            {selectedSubcategoryName && (
              <div className="font-extralight px-3 select-none">
                {selectedSubcategoryName}
              </div>
            )}
            {selectedSubcategoryId && (
              <WithSortableList
                items={posts.filter(
                  (post) => post.subcategory_id === selectedSubcategoryId
                )}
              >
                {(sortedPosts) =>
                  sortedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex justify-between items-center w-full"
                    >
                      <WithSortableItem key={post.id} id={post.id}>
                        <LinkLoader
                          href={`/post/${post.url_slug}`}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-sm transition ",
                            selectedPostId === post.id
                              ? "text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                              : "text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {post.is_private && (
                            <Lock
                              className={
                                "h-3 w-3 text-color-muted inline-block my-auto"
                              }
                            />
                          )}
                          {post.title}
                        </LinkLoader>
                      </WithSortableItem>
                      <SidebarContentDropdown>
                        {({ onClose }) => (
                          <PostUpdateForm post={post} onClose={onClose} />
                        )}
                      </SidebarContentDropdown>
                    </div>
                  ))
                }
              </WithSortableList>
            )}
          </div>
        )}
      </div>

      {/* 🌟 모바일 사이드바 (왼쪽, 오른쪽 공통 컨테이너) */}
      <MobilePostSidebar posts={posts} categories={categories} />
    </div>
  );
}
