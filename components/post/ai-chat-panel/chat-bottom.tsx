import React, { useEffect } from "react";
import ChatFloatingButtons from "@/components/post/ai-chat-panel/chat-floating-buttons";
import ChatInput from "@/components/post/ai-chat-panel/chat-input";
import ChatResetButton from "@/components/post/ai-chat-panel/chat-reset-button";
import StatusMessage from "@/components/post/ai-chat-panel/status-message";
import { useChatSession } from "@/hooks/use-chat-session";
import { useChatStreaming } from "@/hooks/use-chat-streaming";
import { useChatStore } from "@/providers/chat-store-provider";

function ChatBottom() {
  const { resetSession, cleanupSession } = useChatSession();
  const { sendMessage, closeStream, forceReset } = useChatStreaming();
  const isLoading = useChatStore((state) => state.isLoading);

  const handleResetSession = async () => {
    await resetSession(forceReset);
  };

  useEffect(() => {
    return () => {
      closeStream();
      cleanupSession();
    };
  }, [closeStream, cleanupSession]);

  return (
    <div className="relative flex-shrink-0 bg-white dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-700 p-4">
      <ChatFloatingButtons isLoading={isLoading} onSendMessage={sendMessage} />

      <div className="flex flex-col gap-2">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        <div className="flex items-center justify-between">
          <StatusMessage />
          <ChatResetButton
            onResetSession={handleResetSession}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(ChatBottom);
