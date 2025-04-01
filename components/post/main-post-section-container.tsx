"use client";

import { cn } from "@/lib/utils";
import { useAutosave } from "@/providers/autosave-store-provider";
import { ReactNode } from "react";

export default function MainPostSectionContainer({
  children,
}: {
  children: ReactNode;
}) {
  const isEditMode = useAutosave((state) => state.isEditMode);
  return (
    <section
      data-component-name="main-post-containder"
      className={cn(
        "flex flex-1 overflow-auto scrollbar py-6",
        isEditMode ? "bg-white dark:bg-neutral-900" : "bg-clear-mode"
      )}
    >
      {children}
    </section>
  );
}
