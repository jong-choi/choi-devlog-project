"use client";

import dynamic from "next/dynamic";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { useShallow } from "zustand/react/shallow";
import { ReactNode, Fragment } from "react";

const SortableItemWrapperDynamic = dynamic(
  () =>
    import("@/components/post/sortable-list/sortable-item-wrapper").then(
      (mod) => mod.SortableItemWrapper
    ),
  { ssr: false }
);

export function WithSortableItem({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const isSortable = useSidebarStore(useShallow((s) => s.isSortable));
  if (isSortable) {
    return (
      <SortableItemWrapperDynamic id={id}>
        {children}
      </SortableItemWrapperDynamic>
    );
  }
  return <Fragment key={id}>{children}</Fragment>;
}
