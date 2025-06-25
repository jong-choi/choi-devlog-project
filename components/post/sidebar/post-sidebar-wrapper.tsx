import { SidebarState } from "@/hooks/zustand/use-sidebar-store";
import { SidebarStoreProvider } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";

interface PostSidebarProps {
  categories: Category[];
  children: React.ReactNode;
}

export default async function PostSidebarWrapper({
  categories,
  children,
}: PostSidebarProps) {
  const initialState: Partial<SidebarState> = {
    categories: categories,
    posts: [],
  };

  return (
    <SidebarStoreProvider initialState={initialState}>
      {children}
    </SidebarStoreProvider>
  );
}
