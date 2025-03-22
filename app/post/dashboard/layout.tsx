import { getSidebarCategory } from "@/app/post/actions";
import { LeftSidebar } from "@/app/post/left-sidebar";
import PostSidebarWrapper from "@/app/post/post-sidebar";

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
    <>
      <PostSidebarWrapper categories={categories} urlSlug={urlSlug}>
        <LeftSidebar />
      </PostSidebarWrapper>
      {children}
    </>
  );
}
