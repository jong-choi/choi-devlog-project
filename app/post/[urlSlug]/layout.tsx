import { getSidebarCategory } from "@/app/post/actions";
import { LeftSidebar } from "@/components/post/sidebar/left-sidebar";

import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar";

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
  return (
    <PostSidebarWrapper categories={categories} urlSlug={urlSlug}>
      <div className="flex h-screen">
        <LeftSidebar />
        {children}
      </div>
    </PostSidebarWrapper>
  );
}
