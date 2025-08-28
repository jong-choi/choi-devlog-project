import { useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/providers/chat-store-provider";

export function useChunkProcessor() {
  const { updateLastMessage, setIsLoading } = useChatStore(
    useShallow((state) => ({
      updateLastMessage: state.updateLastMessage,
      setIsLoading: state.setIsLoading,
    })),
  );

  // 청크 처리 관련 refs
  const chunkQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 청크를 순차적으로 처리하는 함수
  const processNextChunk = useCallback(
    ({ onDone, delay = 200 }: { onDone?: () => void; delay?: number } = {}) => {
      if (chunkQueueRef.current.length === 0) {
        isProcessingRef.current = false;
        onDone?.();
        return;
      }

      const chunk = chunkQueueRef.current.shift();
      if (chunk) {
        updateLastMessage(chunk);
      }

      processingTimeoutRef.current = setTimeout(
        () => processNextChunk({ onDone, delay }),
        delay,
      );
    },
    [updateLastMessage],
  );

  // 청크를 큐에 추가하고 처리 시작
  const addChunkToQueue = useCallback(
    (chunk: string) => {
      chunkQueueRef.current.push(chunk);
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
        processNextChunk();
      }
    },
    [processNextChunk],
  );

  // 스트리밍 완료 처리
  const finishStreaming = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    const wrapUp = () => {
      setIsLoading(false);
    };

    if (isProcessingRef.current) {
      processNextChunk({ onDone: wrapUp, delay: 50 });
    } else {
      isProcessingRef.current = true;
      processNextChunk({ onDone: wrapUp, delay: 50 });
    }
  }, [processNextChunk, setIsLoading]);

  // 청크 큐 초기화
  const clearChunkQueue = useCallback(() => {
    chunkQueueRef.current = [];
    isProcessingRef.current = false;
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  }, []);

  return {
    addChunkToQueue,
    finishStreaming,
    clearChunkQueue,
  };
}
