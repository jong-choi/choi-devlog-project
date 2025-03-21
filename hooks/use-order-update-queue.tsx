import { useRef } from "react";
import { debounce } from "lodash";
import { Category, Subcategory, Post } from "@/types/post";

// 누적 업데이트용 Map (id -> item)
export const useOrderUpdateQueue = () => {
  const queueRef = useRef(new Map<string, Category | Subcategory | Post>());

  const addToQueue = (item: Category | Subcategory | Post) => {
    queueRef.current.set(item.id, item);
    debouncedSend();
  };

  const sendUpdates = async () => {
    const changedItems = Array.from(queueRef.current.values());
    if (changedItems.length > 0) {
      try {
        // await fetch("/api/update", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(changedItems),
        // });
        console.log("✅ 변경된 order 저장 완료:", changedItems);
      } catch (e) {
        console.error("❌ 저장 실패", e);
      }
      queueRef.current.clear(); // 저장 후 초기화
    }
  };

  const debouncedSend = useRef(debounce(sendUpdates, 5000)).current;

  return { addToQueue };
};
