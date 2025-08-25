import { SidebarTrigger } from "@ui/sidebar-trigger";
import { getPublishedPosts } from "../(app-shell)/posts/fetchers";
import PostsPageRenderer from "@/components/posts/page/posts-page-renderer";

export default async function Page() {
  const { data: postLists } = await getPublishedPosts({ page: 0 });

  return (
    <div className="max-h-screen overflow-scroll">
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
