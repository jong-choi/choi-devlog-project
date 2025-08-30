import React, { RefObject, useEffect, useState } from "react";
import AiMarkdownWrapper from "@/components/markdown/ai-markdown-wrapper/ai-markdown-wrapper";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/providers/chat-store-provider";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessage;
  isLastMessage: boolean;
  ref: RefObject<HTMLDivElement | null> | null;
}

function ChatMessageComponent({
  message,
  isLastMessage,
  ref,
}: ChatMessageProps) {
  // const messgeRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState(0);
  const isLoading = useChatStore((state) => state.isLoading);

  useEffect(() => {
    if (!ref || !ref.current || !isLastMessage || !isLoading) return;

    const resizeObserver = new ResizeObserver(() => {
      if (ref.current && isLoading) {
        const currentHeight = ref.current.offsetHeight;
        setMinHeight((prev) => Math.max(prev, currentHeight));
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isLastMessage, isLoading, ref]);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        ref={ref}
        className={cn(
          "max-w-[90%] whitespace-no-wrap rounded-2xl p-2 pt-0 border",
          message.role === "user"
            ? "bg-blue-50/80 dark:bg-gray-800/70 text-glass-text-neutral border-glass-text-neutral/60 dark:border-gray-700/50"
            : !message.content.length
              ? "hidden"
              : "bg-white/70 dark:bg-neutral-700/80 text-glass-text-neutral border-glass-text-neutral/30 dark:border-neutral-600/50",
        )}
        style={{ minHeight }}
      >
        <AiMarkdownWrapper>{message.content}</AiMarkdownWrapper>
      </div>
    </div>
  );
}

export default React.memo(ChatMessageComponent);
