import { useRef } from "react";
import { debounce } from "lodash";
import { SortableItem } from "@/components/post/sortable-list/sortable-list-container";
import { toast } from "sonner";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { UpdateOrdersPayload } from "@/app/post/actions/sidebar";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

export type OnUpdateFn<T extends SortableItem> = (
  changedItems: T[]
) => Promise<PostgrestSingleResponse<UpdateOrdersPayload>>;

export const useOrderUpdateQueue = <T extends SortableItem>(
  onUpdate?: OnUpdateFn<T>
) => {
  const queueRef = useRef(new Map<string, T>());

  const { setCategoriesPending } = useSidebarStore(
    useShallow((state) => ({
      setCategoriesPending: state.setCategoriesPending,
    }))
  );

  const { setPostsPending } = useLayoutStore(
    useShallow((state) => ({
      setPostsPending: state.setPostsPending,
    }))
  );

  const addToQueue = (item: T) => {
    queueRef.current.set(item.id, item);
    debouncedSend();
  };

  const sendUpdates = async () => {
    const changedItems = Array.from(queueRef.current.values());
    if (changedItems.length > 0) {
      try {
        if (onUpdate) {
          const result = await onUpdate(changedItems);
          if (result.error) {
            toast.warning(
              `${changedItems.length}개의 순서가 저장되지 않았습니다.`,
              {
                description: result.error.message,
              }
            );
          } else if (result.data) {
            toast.success(`변경된 순서 저장 완료: ${changedItems.length}`);
            if (result.data.mode === "posts") {
              setPostsPending(true);
            } else {
              setCategoriesPending(true);
            }
          }
        } else {
          toast.warning(
            `${changedItems.length}개의 순서가 저장되지 않았습니다.`,
            {
              description: "게스트 모드에서는 변경사항이 저장되지 않습니다.",
            }
          );
        }
      } catch (e) {
        toast.error("주제 생성에 실패하였습니다.");
        console.error(e);
      }
      queueRef.current.clear();
    }
  };

  const debouncedSend = useRef(debounce(sendUpdates, 5000)).current;

  return { addToQueue };
};
