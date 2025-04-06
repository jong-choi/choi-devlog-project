import { SidebarState } from "@/hooks/zustand/use-sidebar-store";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";
import { Category, Post } from "@/types/post";

interface PostSidebarProps {
  categories: Category[];
  posts: Post[];
  children: React.ReactNode;
}

export default async function PostSidebarWrapper({
  categories,
  posts,
  children,
}: PostSidebarProps) {
  const initialState: Partial<SidebarState> = {
    categories: categories,
    posts: posts,
  };

  return (
    <SidebarStoreProvider initialState={initialState}>
      {children}
    </SidebarStoreProvider>
  );
}
