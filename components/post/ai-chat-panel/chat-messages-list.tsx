import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";

type ChatMessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface ChatMessagesListProps {
  messages: ChatMessageType[];
}

export function ChatMessagesList({ messages }: ChatMessagesListProps) {
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
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            <ChatMessage message={message} />
          </div>
        ))}
      </div>
    </div>
  );
}
