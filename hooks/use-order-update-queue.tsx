import { useRef } from "react";
import { debounce } from "lodash";
import { SortableItem } from "@/components/post/sortable-list/sortable-list-container";
import { toast } from "sonner";

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
          toast.success(`변경된 순서 저장 완료: ${changedItems.length}`);
        } else {
          toast.warning(
            `${changedItems.length}개의 순서가 저장되지 않았습니다.`,
            {
              description: "게스트 모드에서는 변경사항이 저장되지 않습니다.",
            }
          );
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
