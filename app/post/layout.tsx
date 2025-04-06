import { getSidebarCategory, getSidebarPosts } from "@/app/post/actions";
import { Sidebar } from "@/components/post/sidebar/post-sidebar";
import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar-wrapper";
import { LayoutStoreProvider } from "@/providers/layout-store-provider";

interface PostRootLayoutProps {
  children: React.ReactNode;
}

export default async function PostRootLayout({
  children,
}: PostRootLayoutProps) {
  const { data } = await getSidebarCategory();
  const categories = data || [];
  const { data: PostsData } = await getSidebarPosts();
  const posts = PostsData || [];

  return (
    <LayoutStoreProvider>
      <PostSidebarWrapper categories={categories} posts={posts}>
        <div className="flex h-screen">
          <Sidebar categories={categories} posts={posts} />
          {children}
        </div>
      </PostSidebarWrapper>
    </LayoutStoreProvider>
  );
}
