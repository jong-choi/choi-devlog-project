import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import {
  ChevronLeftIcon,
  X,
  Search,
  ListOrdered,
  Map,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Post, Category } from "@/types/post";
import { Logo } from "@ui/post-top-bar";
import { SidebarCategoryContent } from "@/components/post/sidebar/sidebar-category-content";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { LinkLoader } from "@ui/route-loader";

export function MobilePostSidebar({
  posts,
  categories,
}: {
  posts: Post[];
  categories: Category[];
}) {
  const {
    selectedSubcategoryId,
    selectedSubcategoryName,
    selectedPostId,
    setSubcategory,
  } = useSidebarStore(
    useShallow((state) => ({
      selectedSubcategoryId: state.selectedSubcategoryId,
      selectedSubcategoryName: state.selectedSubcategoryName,
      selectedPostId: state.selectedPostId,
      setSubcategory: state.setSubcategory,
    }))
  );

  const { mobileOpen, toggleMobileOpen, setSidebarRightCollapsed } =
    useLayoutStore(
      useShallow((state) => ({
        mobileOpen: state.mobileOpen,
        toggleMobileOpen: state.toggleMobileOpen,
        setSidebarRightCollapsed: state.setSidebarRightCollapsed,
      }))
    );

  return (
    <div
      className={cn(
        "fixed flex flex-col justify-between md:hidden inset-y-0 left-0 bg-white dark:bg-gray-900 transition-transform duration-300 z-40 shadow-xl overflow-auto",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "w-screen pt-12 p-4" // padding-top 추가
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
        <div className="flex flex-col gap-1">
          <button
            className="mb-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 flex"
            onClick={() => setSubcategory(null)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
            목록보기
          </button>
          {selectedSubcategoryName && (
            <div className="font-extralight px-1 pb-1 select-none">
              {selectedSubcategoryName}
            </div>
          )}
          {posts
            .filter((post) => post.subcategory_id === selectedSubcategoryId)
            .map((post) => (
              <LinkLoader
                key={post.id}
                href={`/post/${post.url_slug}`}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition",
                  selectedPostId === post.id
                    ? "bg-gray-200 text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {post.is_private && (
                  <Lock
                    className={"h-3 w-3 text-color-muted inline-block my-auto"}
                  />
                )}
                {post.title}
              </LinkLoader>
            ))}
        </div>
      ) : (
        <div>
          <Logo />
          <div className="py-4 flex flex-col gap-2">
            {categories.map((cat) => (
              <SidebarCategoryContent
                key={cat.id}
                catagory={cat}
                setSidebarRightCollapsed={setSidebarRightCollapsed}
                setSubcategory={setSubcategory}
                selectedSubcategoryId={selectedSubcategoryId}
              />
            ))}
          </div>
        </div>
      )}
      <div className="py-8 flex flex-col gap-4">
        <hr />
        <LinkLoader href="/posts" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          검색
        </LinkLoader>
        <LinkLoader href="/posts" className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4" />
          전체 게시글
        </LinkLoader>
        <LinkLoader href="/map" className="flex items-center gap-2">
          <Map className="w-4 h-4" />
          지식 지도
        </LinkLoader>
      </div>
    </div>
  );
}
