import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import ChatMessageComponent from "@/components/post/ai-chat-panel/chat-message";
import { useChatStore } from "@/providers/chat-store-provider";

export default function ChatMessagesList() {
  const { messages } = useChatStore(
    useShallow((state) => ({
      messages: state.messages,
      isLoading: state.isLoading,
    })),
  );
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

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
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;

          return (
            <ChatMessageComponent
              key={message.id}
              message={message}
              isLastMessage={isLastMessage}
              ref={isLastMessage ? lastMessageRef : null}
            />
          );
        })}
      </div>
    </div>
  );
}
