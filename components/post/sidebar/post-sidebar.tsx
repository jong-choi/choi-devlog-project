"use client";

import { Suspense } from "react";
import { Lock, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { LinkLoader } from "@ui/route-loader";
import { updateOrders } from "@/app/post/actions/sidebar";
import CategoryCreateForm from "@/components/dialogs/category-forms/category-create-form";
import { CreateDialog } from "@/components/dialogs/create-dialog/create-dialog";
import PostCreateForm from "@/components/dialogs/post-forms/post-create-form";
import PostDeleteForm from "@/components/dialogs/post-forms/post-delete-form";
import PostUpdateForm from "@/components/dialogs/post-forms/post-update-form";
import { SidebarContentDropdown } from "@/components/dialogs/sidebar-content-dropdown/sidebar-content-dropdown";
import { MobilePostSidebar } from "@/components/post/sidebar/mobile-post-sidebar";
import { SidebarCategoryContent } from "@/components/post/sidebar/sidebar-category-content";
import { SidebarSkeleton } from "@/components/post/sidebar/sidebar-skelton";
import ToggleSortableButton from "@/components/post/sortable-list/toggle-sortable-button";
import { WithSortableItem } from "@/components/post/sortable-list/with-sortable-item";
import { WithSortableList } from "@/components/post/sortable-list/with-sortable-list";
import SearchInput from "@/components/posts/infinite-scroll/search-input";
import { Logo } from "@/components/ui/post-top-bar";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { useSidebarStore } from "@/providers/sidebar-store-provider";

export function Sidebar({ inset = false }: { inset?: boolean }) {
  const {
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    isSortable,
    setSidebarLeftCollapsed,
    setSidebarRightCollapsed,
  } = useLayoutStore(
    useShallow((state) => ({
      sidebarLeftCollapsed: state.sidebarLeftCollapsed,
      sidebarRightCollapsed: state.sidebarRightCollapsed,
      isSortable: state.isSortable,
      setSidebarLeftCollapsed: state.setSidebarLeftCollapsed,
      setSidebarRightCollapsed: state.setSidebarRightCollapsed,
    })),
  );

  const {
    posts,
    recentPosts,
    categories,
    selectedSubcategoryId,
    selectedSubcategoryName,
    selectedPostId,
    setSubcategory,
    loading,
  } = useSidebarStore(
    useShallow((state) => ({
      posts: state.posts || [],
      recentPosts: state.recentPosts || [],
      categories: state.categories || [],
      selectedSubcategoryId: state.selectedSubcategoryId,
      selectedSubcategoryName: state.selectedSubcategoryName,
      selectedPostId: state.selectedPostId,
      setSubcategory: state.setSubcategory,
      loading: state.loading,
    })),
  );

  return (
    <div
      className={cn(
        "inline-flex h-full bg-transparent backdrop-blur-sm transition-colors flex-col md:flex-row z-50",
        inset ?? "gap-4 p-4",
      )}
    >
      {/* 왼쪽 사이드바 */}
      <div
        className={cn(
          "hidden md:flex flex-col border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden ",
          sidebarLeftCollapsed ? "w-6 cursor-pointer" : "w-64",
          inset ??
            "rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700",
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
              <Suspense>
                <SearchInput
                  className="py-0 bg-glass-bg-20 shadow-none border h-6"
                  withButton={false}
                  onSidebar={true}
                />
              </Suspense>
            </div>

            <div className="border-t pt-1">
              <div className="flex w-full justify-between">
                <CreateDialog buttonTitle={"분류"} dialogTitle={"분류"}>
                  {({ onClose }) => <CategoryCreateForm onClose={onClose} />}
                </CreateDialog>
                <ToggleSortableButton />
              </div>
              {loading ? (
                <SidebarSkeleton />
              ) : (
                <WithSortableList
                  items={categories}
                  onUpdate={(items) =>
                    updateOrders({ mode: "categories", data: items })
                  }
                >
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
            : "w-64",
        )}
      >
        {!sidebarRightCollapsed && (
          <div className="p-4 w-64 overflow-auto space-y-1 scrollbar flex flex-col">
            {!selectedSubcategoryId && loading && <SidebarSkeleton />}
            {selectedSubcategoryName && (
              <div className="flex flex-col">
                <div
                  className={cn(
                    "font-extralight px-3 select-none",
                    isSortable && "flex-1 whitespace-nowrap overflow-hidden",
                  )}
                >
                  {selectedSubcategoryName}
                </div>
                <div className="self-end">
                  <CreateDialog buttonTitle="게시글" dialogTitle="게시글">
                    {({ onClose }) => <PostCreateForm onClose={onClose} />}
                  </CreateDialog>
                </div>
              </div>
            )}
            {!selectedSubcategoryId && !loading && (
              <>
                <div
                  className={cn(
                    "font-extralight px-3 select-none",
                    isSortable && "flex-1 whitespace-nowrap overflow-hidden",
                  )}
                >
                  Recent Bits and Bobs...
                </div>
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex justify-between items-center w-full"
                  >
                    <LinkLoader
                      href={`/post/${post.url_slug}`}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm transition flex-1",
                        selectedPostId === post.id
                          ? "text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      {post.title}
                    </LinkLoader>
                  </div>
                ))}
              </>
            )}
            {selectedSubcategoryId && (
              <WithSortableList
                items={posts.filter(
                  (post) => post.subcategory_id === selectedSubcategoryId,
                )}
                onUpdate={(items) =>
                  updateOrders({ mode: "posts", data: items })
                }
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
                            "block px-3 py-2 rounded-lg text-sm transition flex-1",
                            selectedPostId === post.id
                              ? "text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                              : "text-gray-700 dark:text-gray-300",
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
                      <SidebarContentDropdown
                        slots={{
                          update: ({ onClose }) => (
                            <PostUpdateForm post={post} onClose={onClose} />
                          ),
                          delete: ({ onClose }) => (
                            <PostDeleteForm post={post} onClose={onClose} />
                          ),
                        }}
                      />
                    </div>
                  ))
                }
              </WithSortableList>
            )}
          </div>
        )}
      </div>
      {/* 모바일 사이드바 (왼쪽, 오른쪽 공통 컨테이너) */}
      <MobilePostSidebar posts={posts} categories={categories} />
    </div>
  );
}
