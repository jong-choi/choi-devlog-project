import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/providers/chat-store-provider";
import type { SessionResponse, ChatMessage } from "@/types/chat";

export function useChatSession() {
  const { sessionId, setSessionId, clearMessages } = useChatStore(
    useShallow((state) => ({
      sessionId: state.sessionId,
      setSessionId: state.setSessionId,
      clearMessages: state.clearMessages,
    }))
  );

  // 세션 생성 또는 기존 세션 반환
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;
    
    const res = await fetch("/api/chat", { method: "POST" });
    if (!res.ok) throw new Error("세션 생성 실패");
    
    const data = (await res.json()) as SessionResponse;
    
    const id = data?.data?.sessionId ?? "";
    if (!id) throw new Error("세션 ID 누락");
    
    setSessionId(id);
    return id;
  }, [sessionId, setSessionId]);

  // 세션 삭제 및 초기화
  const resetSession = useCallback(async () => {
    try {
      // 현재 세션이 있으면 서버에서 삭제
      if (sessionId) {
        await fetch(`/api/chat/${sessionId}`, { method: "DELETE" });
      }
    } catch (error) {
      console.error("세션 삭제 실패:", error);
    } finally {
      // 로컬 상태 초기화
      setSessionId("");
      clearMessages();
    }
  }, [sessionId, setSessionId, clearMessages]);

  // 컴포넌트 언마운트 시 세션 정리
  const cleanupSession = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch(`/api/chat/${sessionId}`, {
          method: "DELETE",
          keepalive: true,
        });
      } catch (error) {
        console.error("세션 정리 실패:", error);
      }
    }
  }, [sessionId]);

  // 서버 상태 동기화
  const syncToServer = useCallback(async (messages: ChatMessage[]) => {
    if (!sessionId) return;

    try {
      await fetch(`/api/chat/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
    } catch (error) {
      console.error("Failed to sync messages to server:", error);
    }
  }, [sessionId]);

  return {
    sessionId,
    ensureSession,
    resetSession,
    cleanupSession,
    syncToServer,
  };
}