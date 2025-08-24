import AiMarkdownWrapper from "@/components/markdown/ai-markdown-wrapper/ai-markdown-wrapper";
import { cn } from "@/lib/utils";
import React from "react";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessageComponent = React.memo<ChatMessageProps>(
  ({ message }) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          message.role === "user" ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[90%] whitespace-no-wrap rounded-2xl p-2 pt-0 border",
            message.role === "user"
              ? "bg-blue-50/80 dark:bg-gray-800/70 text-glass-text-neutral border-glass-text-neutral/60 dark:border-gray-700/50"
              : "bg-white/70 dark:bg-neutral-700/80 text-glass-text-neutral border-glass-text-neutral/30 dark:border-neutral-600/50"
          )}
        >
          <AiMarkdownWrapper>{message.content}</AiMarkdownWrapper>
        </div>
      </div>
    );
  }
);

ChatMessageComponent.displayName = "ChatMessageComponent";
