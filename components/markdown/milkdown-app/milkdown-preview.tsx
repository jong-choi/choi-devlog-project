import ReactMarkdownApp from "@/components/markdown/react-markdown-app";
import React from "react";

export default function MilkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-body milkdown">
      <div className="markdown-preview">
        <ReactMarkdownApp>{markdown}</ReactMarkdownApp>
      </div>
    </div>
  );
}
