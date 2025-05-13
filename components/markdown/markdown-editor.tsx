"use client";
import MilkdownPreview from "@/components/markdown/milkdown-app/milkdown-preview";
import dynamic from "next/dynamic";
import "@/components/markdown/styles/github-markdown.css";
import "@milkdown/crepe/theme/common/style.css";
// https://github.com/Milkdown/milkdown/tree/main/packages/crepe/src/theme
import "@/components/markdown/styles/milkdown-crepe-theme.css";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

const MilkdownWrapper = dynamic(
  () => import("@/components/markdown/milkdown-app/milkdown-wrapper")
);

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  const { isMounted, isEditMode, isFullMode } = useLayoutStore(
    useShallow((state) => ({
      isMounted: state.isMounted,
      isEditMode: state.isEditMode,
      isFullMode: state.isRawOn && state.isMilkdownOn,
    }))
  );

  return (
    <div className="markdown-body w-full relative">
      <div className={cn(isFullMode && "hidden", isEditMode && "opacity-0")}>
        <MilkdownPreview markdown={markdown} />
      </div>
      {isMounted && (
        <div
          className={cn(
            isFullMode && "fixed inset-0 top-56 z-10",
            isEditMode ? "absolute inset-0 z-10" : "w-0 h-0 opacity-0"
          )}
        >
          <MilkdownWrapper markdown={markdown} />
        </div>
      )}
    </div>
  );
}
