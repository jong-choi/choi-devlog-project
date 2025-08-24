import { useRef, useCallback } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/providers/chat-store-provider";
import { useChunkProcessor } from "@/hooks/use-chunk-processor";
import { useChatSession } from "@/hooks/use-chat-session";
import type { ChatEventPayload, MessageRequest } from "@/types/chat";
import { useSummary } from "@/providers/summary-store-provider";

export function useChatStreaming() {
  const postId = useSummary((state) => state.summaryId);
  const { addMessage, setIsLoading, routeType } = useChatStore(
    useShallow((state) => ({
      addMessage: state.addMessage,
      setIsLoading: state.setIsLoading,
      routeType: state.routeType,
    }))
  );

  const { ensureSession } = useChatSession();
  const { addChunkToQueue, finishStreaming, clearChunkQueue } =
    useChunkProcessor();

  const eventSourceRef = useRef<EventSource | null>(null);

  // EventSource 연결 종료
  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    clearChunkQueue();
  }, [clearChunkQueue]);

  // 어시스턴트 메시지 시작
  const handleStartAssistant = useCallback(() => {
    addMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    });
  }, [addMessage]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsLoading(true);

      try {
        // 사용자 메시지 추가
        addMessage({
          id: crypto.randomUUID(),
          role: "user",
          content: message.trim(),
        });

        // 세션 확보
        const sessionId = await ensureSession();

        // 메시지 전송
        const requestBody: MessageRequest = {
          message: message.trim(),
          type: routeType,
          postId: postId || "",
        };

        const res = await fetch(`/api/chat/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) throw new Error("메시지 전송 실패");

        // 기존 스트림 종료 후 새 스트림 시작
        closeStream();
        const es = new EventSource(`/api/chat/${sessionId}`);
        eventSourceRef.current = es;

        // 이벤트 핸들러 설정
        es.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data) as ChatEventPayload;

            if (payload.event === "on_chat_model_start") {
              handleStartAssistant();
            } else if (payload.event === "on_chat_model_stream") {
              const delta = payload?.chunk?.content ?? "";
              if (delta) addChunkToQueue(delta);
            } else if (payload.event === "on_chat_model_end") {
              finishStreaming();
              es.close();
              eventSourceRef.current = null;
            }
          } catch (error) {
            console.error("스트림 파싱 에러:", error);
          }
        };

        // 에러 핸들러 설정
        es.onerror = () => {
          setIsLoading(false);
          es.close();
          eventSourceRef.current = null;
          clearChunkQueue();
          toast.error("연결이 끊어졌습니다.");
        };
      } catch (error) {
        setIsLoading(false);
        console.error("메시지 전송 에러:", error);
        toast.error("메시지 전송에 실패했습니다.");
      }
    },
    [
      setIsLoading,
      addMessage,
      ensureSession,
      routeType,
      postId,
      closeStream,
      handleStartAssistant,
      addChunkToQueue,
      finishStreaming,
      clearChunkQueue,
    ]
  );

  return {
    sendMessage,
    closeStream,
  };
}
