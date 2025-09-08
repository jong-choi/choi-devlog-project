import { Logo } from "@ui/post-top-bar";
import { SidebarTrigger } from "@ui/sidebar-trigger";
import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import IndexSelectionInitializer from "@/components/post/sidebar/index-selection-initializer";
import SidebarCloseOnMount from "@/components/post/sidebar/sidebar-close-on-mount";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";

export default async function Page() {
  const { data: postLists } = await getPublishedPosts({ page: 0 });

  return (
    <div>
      <SidebarCloseOnMount />
      <IndexSelectionInitializer />
      <div className="md:sticky md:top-0 z-20">
        <header
          data-component-name="main-header"
          className="h-[48px] border-b border-border flex justify-between items-center dark:from-[#1b1b1b] dark:to-[#121212] text-sm text-gray-600 dark:text-gray-400  bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex gap-2">
              <Logo />
            </div>
          </div>
        </header>
      </div>
      <PostsPageRenderer initialPosts={postLists || []} />
    </div>
  );
}
