import {
  getSidebarPublishedPosts,
  getSidebarCategory,
} from "@/app/post/fetchers";
import { Sidebar } from "@/components/post/sidebar/post-sidebar";
import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar-wrapper";
import SidebarHydrator from "@/components/post/sidebar/sidebar-hydrator";
import { LayoutStoreProvider } from "@/providers/layout-store-provider";

interface PostRootLayoutProps {
  children: React.ReactNode;
}

export default async function PostRootLayout({
  children,
}: PostRootLayoutProps) {
  const { data } = await getSidebarCategory();
  const categories = data || [];
  const { data: PostsData } = await getSidebarPublishedPosts();
  const posts = PostsData || [];

  return (
    <LayoutStoreProvider>
      <PostSidebarWrapper categories={categories} posts={posts}>
        <div className="flex h-screen">
          <Sidebar />
          <SidebarHydrator />
          {children}
        </div>
      </PostSidebarWrapper>
    </LayoutStoreProvider>
  );
}
