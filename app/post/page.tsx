import { SidebarTrigger } from "@ui/sidebar-trigger";
import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import IndexSelectionInitializer from "@/components/post/sidebar/index-selection-initializer";
import SidebarCloseOnMount from "@/components/post/sidebar/sidebar-close-on-mount";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";

export default async function Page() {
  const { data: postLists } = await getPublishedPosts({ page: 0 });

  return (
    <div className="max-h-screen overflow-scroll">
      <SidebarCloseOnMount />
      <IndexSelectionInitializer />
      <header
        data-component-name="main-header"
        className="h-[62px] flex pt-3 bg-glass-bg-40 backdrop-blur-2xl"
      >
        <SidebarTrigger className="-ml-1" />
      </header>
      <PostsPageRenderer initialPosts={postLists || []} />
    </div>
  );
}
