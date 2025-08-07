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
  return (
    <LayoutStoreProvider>
      <div className="flex h-screen">
        <PostSidebarWrapper>
          <Sidebar />
          <SidebarHydrator />
        </PostSidebarWrapper>
        {children}
      </div>
    </LayoutStoreProvider>
  );
}
