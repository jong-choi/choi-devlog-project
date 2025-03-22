"use client";
import "@/components/markdown/github-markdown.css";
import MilkdownWrapper from "@/components/markdown/milkdown-app/milkdown-wrapper";

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-body w-full">
      <MilkdownWrapper markdown={markdown} />
    </div>
  );
}
