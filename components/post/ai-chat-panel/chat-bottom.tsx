import { useChatSession } from "@/hooks/use-chat-session";
import { useChatStreaming } from "@/hooks/use-chat-streaming";
import { useEffect } from "react";
import { ChatInput } from "@/components/post/ai-chat-panel/chat-input";
import { RouteTypeSelector } from "@/components/post/ai-chat-panel/route-type-selector";
import { useChatStore } from "@/providers/chat-store-provider";
import { useShallow } from "zustand/react/shallow";

export default function ChatBottom() {
  // 커스텀 훅들
  const { resetSession, cleanupSession } = useChatSession();
  const { sendMessage, closeStream } = useChatStreaming();
  const isLoading = useChatStore(
    useShallow((state) => state.isLoading)
  );
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      closeStream();
      cleanupSession();
    };
  }, [closeStream, cleanupSession]);
  return (
    <div className="flex-shrink-0 bg-white dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-700 p-4">
      <RouteTypeSelector onResetSession={resetSession} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
