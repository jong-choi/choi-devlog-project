"use client";

import { useShallow } from "zustand/react/shallow";
import "@milkdown/crepe/theme/common/style.css";
import MilkdownWrapper from "@/components/markdown/milkdown-app/milkdown-wrapper";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

export default function MarkdownEditor({
  markdown,
  children,
}: {
  markdown: string;
  children: React.ReactNode;
}) {
  const { isMounted, isEditMode, isFullMode } = useLayoutStore(
    useShallow((state) => ({
      isMounted: state.isMounted,
      isEditMode: state.isEditMode,
      isFullMode: state.isRawOn && state.isMilkdownOn,
    })),
  );

  return (
    <div className="markdown-body w-full relative pb-28">
      <div
        className={cn(isEditMode && "opacity-0")}
        aria-hidden={isEditMode || isFullMode}
      >
        {children}
      </div>
      {isMounted && (
        <div
          className={cn(
            isFullMode && "fixed inset-0 top-56 z-10",
            isEditMode
              ? "absolute inset-0 z-10"
              : "w-0 h-0 opacity-0 overflow-hidden pointer-events-none",
          )}
          aria-hidden={!isEditMode}
        >
          <MilkdownWrapper markdown={markdown} />
        </div>
      )}
    </div>
  );
}
