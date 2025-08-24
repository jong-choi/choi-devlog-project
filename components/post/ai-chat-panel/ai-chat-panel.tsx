"use client";

import { MainContainer } from "@ui/main-container";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { ChatHeader } from "@/components/post/ai-chat-panel/chat-header";
import { ChatMessagesList } from "@/components/post/ai-chat-panel/chat-messages-list";
import { useSummary } from "@/providers/summary-store-provider";
import { useChatStore } from "@/providers/chat-store-provider";
import ChatBottom from "@/components/post/ai-chat-panel/chat-bottom";

export default function AIChatPanel() {
  const { addMessage } = useChatStore(
    useShallow((state) => ({ addMessage: state.addMessage }))
  );

  // 레이아웃 상태
  const { rightPanelOpen, setRightPanelOpen } = useLayoutStore(
    useShallow((state) => ({
      rightPanelOpen: state.rightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  // 요약 상태
  const { summary } = useSummary(
    useShallow((state) => ({ summary: state.summary }))
  );

  // 요약이 있을 때 메시지로 추가
  useEffect(() => {
    if (summary) {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: summary,
      });
    }
  }, [summary, addMessage]);

  return (
    <MainContainer className="text-color-base overflow-scroll scrollbar-hidden text-shadow">
      <ChatHeader
        rightPanelOpen={rightPanelOpen}
        onTogglePanel={() => setRightPanelOpen(!rightPanelOpen)}
      />
      <section
        data-component-name="main-post-section"
        className="flex flex-1 overflow-auto scrollbar-hidden px-4"
      >
        <ChatMessagesList />
      </section>
      <ChatBottom />
    </MainContainer>
  );
}
