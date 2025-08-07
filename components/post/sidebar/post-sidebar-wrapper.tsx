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

  const initialState: Partial<SidebarState> = {
    posts: posts || [],
    categories: categories || [],
  };
  return (
    <SidebarStoreProvider initialState={initialState}>
      {children}
    </SidebarStoreProvider>
  );
}
