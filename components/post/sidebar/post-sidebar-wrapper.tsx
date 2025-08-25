import { getPublishedPosts } from "@/app/(app-shell)/posts/fetchers";
import {
  getSidebarCategory,
  getSidebarPublishedPosts,
} from "@/app/post/fetchers";
import { SidebarState } from "@/hooks/zustand/use-sidebar-store";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";

interface PostSidebarProps {
  children: React.ReactNode;
}

export default async function PostSidebarWrapper({
  children,
}: PostSidebarProps) {
  const { data: categories } = await getSidebarCategory();
  const { data: posts } = await getSidebarPublishedPosts();
  const { data: postLists } = await getPublishedPosts({ page: 0 });

  const initialState: Partial<SidebarState> = {
    posts: posts || [],
    categories: categories || [],
    recentPosts: postLists || [],
  };
  return (
    <SidebarStoreProvider initialState={initialState}>
      {children}
    </SidebarStoreProvider>
  );
}
