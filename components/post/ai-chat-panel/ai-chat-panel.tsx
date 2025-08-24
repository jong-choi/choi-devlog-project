"use client";

import { MainContainer } from "@ui/main-container";
import { toast } from "sonner";
import { useLayoutStore } from "@/providers/layout-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/post/ai-chat-panel/chat-header";
import { ChatMessagesList } from "@/components/post/ai-chat-panel/chat-messages-list";
import { RouteTypeSelector } from "@/components/post/ai-chat-panel/route-type-selector";
import { ChatInput } from "@/components/post/ai-chat-panel/chat-input";
import { useSummary } from "@/providers/summary-store-provider";

type RouteType = "chat" | "google" | "summary" | "recommend";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const generateId = () => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export default function AIChatPanel() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const routeTypeRef = useRef<RouteType>("chat");
  const { summary } = useSummary(
    useShallow((state) => {
      return { summary: state.summary };
    })
  );
  // const recommendedPosts = useSummary(
  //   useShallow((state) => state.recommendedPosts)
  // );


  const { rightPanelOpen, setRightPanelOpen } = useLayoutStore(
    useShallow((state) => ({
      rightPanelOpen: state.rightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  useEffect(() => {
    if (summary) {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: summary },
      ]);
    }
  }, [summary]);

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const res = await fetch("/api/chat", { method: "POST" });
    if (!res.ok) throw new Error("세션 생성 실패");
    const data = (await res.json()) as {
      success: boolean;
      data?: { sessionId: string };
    };
    const id = data?.data?.sessionId ?? "";
    if (!id) throw new Error("세션 ID 누락");
    setSessionId(id);
    return id;
  };

  const closeStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // 초기화 버튼을 누르면 세션을 삭제한다.
  const resetSession = () => {
    try {
      closeStream();
    } catch (e) {
      console.error(e);
    } finally {
      setSessionId("");
      setMessages([]);
      if (sessionId) {
        void fetch(`/api/chat/${sessionId}`, { method: "DELETE" });
      }
    }
  };

  const handleStartAssistant = () => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "assistant", content: "" },
    ]);
  };

  const handleStreamChunk = (content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant") return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...last,
        content: (last.content ?? "") + content,
      };
      return updated;
    });
  };

  // 전송을 시도하고 세션이 없는 경우에 새로 아이디를 만든다.
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "user", content: message.trim() },
      ]);

      const id = await ensureSession();

      const res = await fetch(`/api/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          type: routeTypeRef.current,
        }),
      });
      if (!res.ok) throw new Error("메시지 전송 실패");

      closeStream();
      const es = new EventSource(`/api/chat/${id}`);
      eventSourceRef.current = es;

      es.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data) as {
            event?: string;
            name?: string;
            chunk?: { content?: string };
            message?: string;
          };

          if (payload.event === "on_chat_model_start") {
            handleStartAssistant();
          } else if (payload.event === "on_chat_model_stream") {
            const delta = payload?.chunk?.content ?? "";
            if (delta) handleStreamChunk(delta);
          } else if (payload.event === "on_chat_model_end") {
            setIsLoading(false);
            es.close();
            eventSourceRef.current = null;
          }
        } catch (e) {
          console.error(e);
        }
      };

      es.onerror = () => {
        setIsLoading(false);
        es.close();
        eventSourceRef.current = null;
        toast.error("연결이 끊어졌습니다.");
      };
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error("메시지 전송에 실패했습니다.");
    }
  };

  useEffect(() => {
    return () => {
      closeStream();
      if (sessionId) {
        fetch(`/api/chat/${sessionId}`, {
          method: "DELETE",
          keepalive: true,
        }).catch((error) => {
          console.error(error);
        });
      }
    };
  }, [sessionId]);

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
        <ChatMessagesList messages={messages} />
      </section>
      <div className="flex-shrink-0 bg-white dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-700 p-4">
        <RouteTypeSelector
          routeTypeRef={routeTypeRef}
          onResetSession={resetSession}
          isLoading={isLoading}
        />
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </MainContainer>
  );
}
