import "@/components/markdown/github-markdown.css";
import MilkdownWrapper from "@/components/markdown/milkdown-app/milkdown-wrapper";
import ReactMarkdown from "react-markdown";

export default function MarkdownEditor({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-body w-full">
      <MilkdownWrapper markdown={markdown} />
      <div className="hidden" aria-hidden="true">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
