import AIChatPanel from "@/components/post/ai-chat-panel/ai-chat-panel";
import { RightPanelWrapper } from "@/components/post/right-panel/right-panel-wrapper";
import { Sidebar } from "@/components/post/sidebar/post-sidebar";
import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar-wrapper";
import SidebarHydrator from "@/components/post/sidebar/sidebar-hydrator";
import { ChatStoreProvider } from "@/providers/chat-store-provider";
import { LayoutStoreProvider } from "@/providers/layout-store-provider";
import { SummaryProvider } from "@/providers/summary-store-provider";

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
        <SummaryProvider>
          {children}
          <RightPanelWrapper>
            <ChatStoreProvider>
              <AIChatPanel />
            </ChatStoreProvider>
          </RightPanelWrapper>
        </SummaryProvider>
      </div>
    </LayoutStoreProvider>
  );
}
