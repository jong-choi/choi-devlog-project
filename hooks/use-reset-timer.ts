import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/providers/chat-store-provider";

export function useResetTimer() {
  const [canReset, setCanReset] = useState(true); // 로딩시작 후 일정 시간 지나면 리셋 가능
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoading = useChatStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) {
      setCanReset(false);

      const BLOCKING_TIME = 1000 * 15; // 15초

      timerRef.current = setTimeout(() => {
        setCanReset(true);
        timerRef.current = null;
      }, BLOCKING_TIME);
    } else {
      setCanReset(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // 클린업
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading]);

  return { canReset };
}
