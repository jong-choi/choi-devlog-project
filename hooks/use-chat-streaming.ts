import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useChatSession } from "@/hooks/use-chat-session";
import { useChunkProcessor } from "@/hooks/use-chunk-processor";
import { useChatStore } from "@/providers/chat-store-provider";
import { useSummary } from "@/providers/summary-store-provider";
import type { ChatEventPayload, MessageRequest } from "@/types/chat";

export function useChatStreaming() {
  const postId = useSummary((state) => state.summaryId);
  const {
    addMessage,
    setIsLoading,
    routeType,
    setStatusMessage,
    clearStatusMessage,
  } = useChatStore(
    useShallow((state) => ({
      addMessage: state.addMessage,
      setIsLoading: state.setIsLoading,
      routeType: state.routeType,
      setStatusMessage: state.setStatusMessage,
      clearStatusMessage: state.clearStatusMessage,
    })),
  );

  const { ensureSession } = useChatSession();
  const { addChunkToQueue, finishStreaming, clearChunkQueue } =
    useChunkProcessor();

  const eventSourceRef = useRef<EventSource | null>(null);

  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    clearChunkQueue();
  }, [clearChunkQueue]);

  const forceReset = useCallback(() => {
    closeStream();
    setIsLoading(false);
    clearStatusMessage();
  }, [clearStatusMessage, closeStream, setIsLoading]);

  const handleStartAssistant = useCallback(() => {
    addMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    });
  }, [addMessage]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsLoading(true);

      try {
        addMessage({
          id: crypto.randomUUID(),
          role: "user",
          content: message.trim(),
        });

        const sessionId = await ensureSession();

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

        if (!res.ok) {
          if (res.status === 429) {
            addMessage({
              id: Math.random().toFixed(5),
              role: "assistant",
              content:
                "게스트 모드 사용량을 초과하였습니다. 잠시 후 다시 시도해주세요.",
            });
            throw new Error("게스트 모드 사용량을 초과하였습니다.");
          }
          throw new Error("메시지 전송에 실패했습니다.");
        }

        closeStream();
        const es = new EventSource(`/api/chat/${sessionId}`);
        eventSourceRef.current = es;

        es.onmessage = (evt) => {
          try {
            if (
              es !== eventSourceRef.current ||
              es.readyState === EventSource.CLOSED
            ) {
              return;
            }

            const payload = JSON.parse(evt.data) as ChatEventPayload;

            if (payload.event === "on_chat_model_start") {
              handleStartAssistant();
            } else if (payload.event === "on_chat_model_stream") {
              const delta = payload?.chunk?.content ?? "";
              if (delta) {
                addChunkToQueue(delta);
              }
            } else if (payload.event === "on_chat_model_end") {
              finishStreaming();
              clearStatusMessage();
              es.close();
              eventSourceRef.current = null;
            } else if (payload.event === "status") {
              const statusMsg = payload.message ?? "";
              if (statusMsg) {
                setStatusMessage(statusMsg);
              }
            }
          } catch (error) {
            console.error("스트림 파싱 에러:", error);
          }
        };

        es.onerror = () => {
          if (es !== eventSourceRef.current) return;
          setIsLoading(false);
          toast.error("연결이 끊어졌습니다.");
          addMessage({
            id: Math.random().toFixed(5),
            role: "assistant",
            content: "연결이 끊어졌습니다.",
          });
          es.close();
          eventSourceRef.current = null;
          clearChunkQueue();
        };
      } catch (error) {
        setIsLoading(false);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "메시지 전송에 실패했습니다.";
        toast.error(errorMessage);
        addMessage({
          id: Math.random().toFixed(5),
          role: "assistant",
          content: "에러가 발생하였습니다. (" + errorMessage + ")",
        });
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
      setStatusMessage,
      clearStatusMessage,
    ],
  );

  return {
    sendMessage,
    closeStream,
    forceReset,
  };
}
