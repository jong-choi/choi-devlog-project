"use client";
import dynamic from "next/dynamic";
import "@/components/markdown/github-markdown-light.css";
import "@/components/markdown/markdown-editor.css";
import ReactMarkdownWrapper from "@/components/markdown/react-markdown-wrapper/react-markdown-wrapper";
import { useState } from "react";
import { cn } from "@/lib/utils";
const MdxEditorWrapper = dynamic(
  () => import("@/components/markdown/mdx-editor-wrapper/mdx-editor-wrapper"),
  {
    ssr: false,
  }
);

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  const [isFocused, setIsFocused] = useState(false);
  const onClickHandler = () => {
    setIsFocused(true);
  };

  return (
    <div className="markdown-body new-york" onClick={onClickHandler}>
      <div className={cn(isFocused && "hidden")}>
        <ReactMarkdownWrapper>{markdown}</ReactMarkdownWrapper>
      </div>
      <div className={cn(!isFocused && "hidden")}>
        <MdxEditorWrapper markdown={markdown} />
      </div>
    </div>
  );
}
