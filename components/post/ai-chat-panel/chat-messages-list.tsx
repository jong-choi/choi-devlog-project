import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import ChatMessageComponent from "@/components/post/ai-chat-panel/chat-message";
import { useChatStore } from "@/providers/chat-store-provider";

export default function ChatMessagesList() {
  const messages = useChatStore(useShallow((state) => state.messages));
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const isLoading = useChatStore((state) => state.isLoading);
  useEffect(() => {
    if (!lastMessageRef.current || !listRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "auto",
        });
      }
    });

    resizeObserver.observe(lastMessageRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col flex-1 rounded-2xl bg-glass-bg/25 px-2 pt-2">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto pb-12 space-y-3 scrollbar-hidden"
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            {!!message.content.length && (
              <ChatMessageComponent message={message} />
            )}
            {isLoading &&
              index === messages.length - 1 &&
              (message.role === "user" || !message.content.length) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
