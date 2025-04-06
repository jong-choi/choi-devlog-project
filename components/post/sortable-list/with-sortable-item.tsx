"use client";

import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { ReactNode, Fragment } from "react";
import { useLayoutStore } from "@/providers/layout-store-provider";

const SortableItemWrapperDynamic = dynamic(() =>
  import("@/components/post/sortable-list/sortable-item-wrapper").then(
    (mod) => mod.SortableItemWrapper
  )
);

export function WithSortableItem({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const isSortable = useLayoutStore(useShallow((s) => s.isSortable));
  if (isSortable) {
    return (
      <SortableItemWrapperDynamic id={id}>
        {children}
      </SortableItemWrapperDynamic>
    );
  }
  return <Fragment key={id}>{children}</Fragment>;
}
