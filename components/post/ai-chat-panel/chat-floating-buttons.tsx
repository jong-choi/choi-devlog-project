import { useMemo } from "react";
import { useChatStore } from "@/providers/chat-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useSummary } from "@/providers/summary-store-provider";
import { useChatSession } from "@/hooks/use-chat-session";

export default function ChatFloatingButtons() {
  const { addMessage } = useChatStore(
    useShallow((state) => ({
      addMessage: state.addMessage,
    }))
  );
  const { ensureSession, syncToServer } = useChatSession();

  const recommendedPosts = useSummary(
    useShallow((state) => state.recommendedPosts)
  );
  const isRecommendedPosts = !!recommendedPosts.length;

  const markdownMessage = useMemo(() => {
    if (!recommendedPosts.length) return "";

    const postLinks = recommendedPosts
      .map((post) => `- [${post.title}](/post/${post.urlSlug})`)
      .join("\n");

    return `유사도 분석으로 추천한 게시글 입니다!\n\n${postLinks}`;
  }, [recommendedPosts]);

  // 프론트엔드에서 응답을 생성해서 백엔드로 밀어넣는 구조.
  const onRecommendClick = async () => {
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: "연관 게시물을 추천해줘!",
    };

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: markdownMessage,
    };

    addMessage(userMessage);
    addMessage(assistantMessage);

    await ensureSession();
    await syncToServer([userMessage, assistantMessage]);
  };

  return (
    <div className="absolute -top-10 left-0 px-6 flex gap-2">
      {isRecommendedPosts && (
        <button
          onClick={onRecommendClick}
          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-color-muted/50 text-neutral-600 text-xs font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap dark:bg-neutral-800/30 dark:hover:bg-neutral-800/50 dark:text-neutral-300 disabled:opacity-50"
        >
          연관 게시물 추천해줘
        </button>
      )}
    </div>
  );
}
