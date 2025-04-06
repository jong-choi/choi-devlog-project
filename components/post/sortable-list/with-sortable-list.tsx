"use client";

import dynamic from "next/dynamic";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { SortableItem } from "@/components/post/sortable-list/sortable-list-container";

export const SortableListContainerDynamic = dynamic(() =>
  import("@/components/post/sortable-list/sortable-list-container").then(
    (mod) => mod.SortableListContainer
  )
);

type Props<T extends SortableItem> = {
  items: T[];
  children: (items: T[]) => React.ReactNode;
  onUpdate?: (items: SortableItem[]) => void | Promise<void>; // ✅ 추가
};

export function WithSortableList<T extends SortableItem>({
  items,
  children,
  onUpdate, // ✅ 받기
}: Props<T>) {
  const isSortable = useSidebarStore(useShallow((s) => s.isSortable));

  if (isSortable) {
    return (
      <SortableListContainerDynamic items={items} onUpdate={onUpdate}>
        {children as (items: SortableItem[]) => React.ReactNode}
      </SortableListContainerDynamic>
    );
  }

  return <>{children(items)}</>;
}
