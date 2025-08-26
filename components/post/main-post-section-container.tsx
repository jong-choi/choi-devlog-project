"use client";

import { ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function MainPostSectionContainer({
  children,
}: {
  children: ReactNode;
}) {
  const { isEditMode } = useLayoutStore(
    useShallow((state) => ({
      isEditMode: state.isEditMode,
    })),
  );
  return (
    <section
      data-component-name="main-post-containder"
      className={cn(
        "flex flex-1 py-6",
        isEditMode ? "bg-white dark:bg-neutral-900" : "bg-clear-mode",
      )}
    >
      {children}
    </section>
  );
}
