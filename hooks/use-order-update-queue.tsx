import { useRef } from "react";
import { debounce } from "lodash";
import { SortableItem } from "@/components/post/sortable-list/sortable-list-container";

export type OnUpdateFn<T extends SortableItem> = (
  changedItems: T[]
) => void | Promise<void>;

export const useOrderUpdateQueue = <T extends SortableItem>(
  onUpdate?: OnUpdateFn<T>
) => {
  const queueRef = useRef(new Map<string, T>());

  const addToQueue = (item: T) => {
    queueRef.current.set(item.id, item);
    debouncedSend();
  };

  const sendUpdates = async () => {
    const changedItems = Array.from(queueRef.current.values());
    if (changedItems.length > 0) {
      try {
        if (onUpdate) {
          await onUpdate(changedItems);
          console.log("✅ 변경된 order 저장 완료:", changedItems);
        } else {
          console.log("⚠️ onUpdate 없음. 변경된 항목:", changedItems);
        }
      } catch (e) {
        console.error("❌ 저장 실패", e);
      }
      queueRef.current.clear();
    }
  };

  const debouncedSend = useRef(debounce(sendUpdates, 5000)).current;

  return { addToQueue };
};

// await fetch("/api/update", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify(changedItems),
// });
