"use client";
import "@/components/markdown/github-markdown-light.css";
import "@/components/markdown/markdown-editor.css";
import MilkdownWrapper from "@/components/markdown/milkdown-app/milkdown-wrapper";

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-body new-york">
      <MilkdownWrapper markdown={markdown} />
    </div>
  );
}
