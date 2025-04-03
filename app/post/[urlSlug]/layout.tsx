import { getSidebarCategory, getSidebarPosts } from "@/app/post/actions";
import { Sidebar } from "@/components/post/sidebar/post-sidebar";

import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar-wrapper";
import { getSeriesList } from "@/components/series/actions";

interface PostLayoutProps {
  params: Promise<{
    urlSlug?: string;
  }>;

  children: React.ReactNode;
}

export default async function PostLayout({
  params,
  children,
}: PostLayoutProps) {
  const urlSlug = (await params).urlSlug || "";
  const { data } = await getSidebarCategory();
  const categories = data || [];
  const { data: PostsData } = await getSidebarPosts();
  const posts = PostsData || [];
  const { data: seriesData } = await getSeriesList();

  return (
    <PostSidebarWrapper categories={categories} urlSlug={urlSlug} posts={posts}>
      <div className="flex h-screen">
        <Sidebar
          categories={categories}
          posts={posts}
          seriesList={seriesData}
        />
        {children}
      </div>
    </PostSidebarWrapper>
  );
}
