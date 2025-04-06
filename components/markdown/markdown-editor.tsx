"use client";
import MilkdownPreview from "@/components/markdown/milkdown-app/milkdown-preview";
import { useAutosave } from "@/providers/autosave-store-provider";
import dynamic from "next/dynamic";
import "@/components/markdown/styles/github-markdown.css";
import "@milkdown/crepe/theme/common/style.css";
// https://github.com/Milkdown/milkdown/tree/main/packages/crepe/src/theme
import "@/components/markdown/styles/milkdown-crepe-theme.css";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

const MilkdownWrapper = dynamic(
  () => import("@/components/markdown/milkdown-app/milkdown-wrapper")
);

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  const { isEditMode, isFullMode } = useAutosave(
    useShallow((state) => ({
      isEditMode: state.isEditMode,
      isFullMode: state.isRawOn && state.isMarkdownOn,
    }))
  );

  return (
    <div className="markdown-body w-full relative">
      <div className={cn(isFullMode && "hidden")}>
        <MilkdownPreview markdown={markdown} />
      </div>
      {isEditMode && (
        <div
          className={cn(
            isFullMode ? "fixed inset-0 top-56 z-10" : "absolute inset-0 z-10"
          )}
        >
          <MilkdownWrapper markdown={markdown} />
        </div>
      )}
    </div>
  );
}
