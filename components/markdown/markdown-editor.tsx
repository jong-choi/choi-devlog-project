"use client";
import dynamic from "next/dynamic";
import "@/components/markdown/github-markdown-light.css";
import "@/components/markdown/markdown-editor.module.css";
import ReactMarkdownWrapper from "@/components/markdown/react-markdown-wrapper/react-markdown-wrapper";

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  const MdxEditorWrapper = dynamic(
    () => import("@/components/markdown/mdx-editor-wrapper/mdx-editor-wrapper"),
    {
      ssr: false,
      loading: () => <ReactMarkdownWrapper>{markdown}</ReactMarkdownWrapper>,
    }
  );

  return (
    <div>
      <MdxEditorWrapper markdown={markdown} />
    </div>
  );
}
