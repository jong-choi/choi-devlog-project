"use client";

import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import "@milkdown/crepe/theme/common/style.css";
import MilkdownPreview from "@/components/markdown/milkdown-app/milkdown-preview";
import "@/components/markdown/styles/github-markdown.css";
// https://github.com/Milkdown/milkdown/tree/main/packages/crepe/src/theme
import "@/components/markdown/styles/milkdown-crepe-theme.css";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/providers/layout-store-provider";

const MilkdownWrapper = dynamic(
  () => import("@/components/markdown/milkdown-app/milkdown-wrapper"),
);

export default function MarkdownEditor({ markdown }: { markdown: string }) {
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
        <MilkdownPreview markdown={markdown} />
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
