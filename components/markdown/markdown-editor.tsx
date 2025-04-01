"use client";
import "@/components/markdown/github-markdown.css";
import MilkdownPreview from "@/components/markdown/milkdown-app/milkdown-preview";
import MilkdownWrapper from "@/components/markdown/milkdown-app/milkdown-wrapper";
import { useAutosave } from "@/providers/autosave-store-provider";

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  const isEditMode = useAutosave((state) => state.isEditMode);
  return (
    <div className="markdown-body w-full">
      {isEditMode ? (
        <MilkdownWrapper markdown={markdown} />
      ) : (
        <MilkdownPreview markdown={markdown} />
      )}
    </div>
  );
}
