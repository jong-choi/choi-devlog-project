import { getSidebarCategory } from "@/app/post/fetchers";
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

  return (
    <LayoutStoreProvider>
      <PostSidebarWrapper categories={categories}>
        <div className="flex h-screen">
          <Sidebar />
          <SidebarHydrator />
          {children}
        </div>
      </PostSidebarWrapper>
    </LayoutStoreProvider>
  );
}
