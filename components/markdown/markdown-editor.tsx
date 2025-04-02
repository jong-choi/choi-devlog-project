"use client";
import "@/components/markdown/github-markdown.css";
import MilkdownPreview from "@/components/markdown/milkdown-app/milkdown-preview";
import { useAutosave } from "@/providers/autosave-store-provider";
import dynamic from "next/dynamic";
import "@milkdown/crepe/theme/common/style.css";
// https://github.com/Milkdown/milkdown/tree/main/packages/crepe/src/theme
import "@/components/markdown/milkdown-app/milkdown-crepe-theme.css";
import { cn } from "@/lib/utils";

const MilkdownWrapper = dynamic(
  () => import("@/components/markdown/milkdown-app/milkdown-wrapper"),
  {
    ssr: false, // 필요 시
  }
);

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  const isEditMode = useAutosave((state) => state.isEditMode);
  const isFullMode = useAutosave(
    (state) => state.isRawOn && state.isMarkdownOn
  );

  return (
    <div className="markdown-body w-full relative">
      <MilkdownPreview markdown={markdown} />
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
