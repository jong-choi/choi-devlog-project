import AIChatPanel from "@/components/post/ai-chat-panel/ai-chat-panel";
import { RightPanelWrapper } from "@/components/post/right-panel/right-panel-wrapper";
import { Sidebar } from "@/components/post/sidebar/post-sidebar";
import PostSidebarWrapper from "@/components/post/sidebar/post-sidebar-wrapper";
import PrivatePostsHydrator from "@/components/post/sidebar/private-posts-hydrator";
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
      <div className="flex">
        <PostSidebarWrapper>
          <div className="h-dvh sticky top-0 z-30">
            <Sidebar />
          </div>
          <PrivatePostsHydrator />
          <SummaryProvider>
            {children}
            <ChatStoreProvider>
              <div className="h-dvh sticky top-0 z-30">
                <RightPanelWrapper>
                  <AIChatPanel />
                </RightPanelWrapper>
              </div>
            </ChatStoreProvider>
          </SummaryProvider>
        </PostSidebarWrapper>
      </div>
    </LayoutStoreProvider>
  );
}
