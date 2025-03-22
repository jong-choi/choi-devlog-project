import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // rehype-highlight 스타일 추가
import { cn } from "@/lib/utils";
import "@/components/markdown/github-markdown.css";
import "@/components/markdown/ai-markdown-wrapper/small-header-markdown.css";

interface ReactMarkdownWrapperProps {
  className?: string;
  children?: string;
}

export default function AiMarkdownWrapper({
  children,
  className,
}: ReactMarkdownWrapperProps) {
  return (
    <div
      className={cn(
        "p-[12px] markdown-body new-york-small ai-fadein",
        className || ""
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
