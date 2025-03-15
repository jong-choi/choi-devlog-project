import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // rehype-highlight 스타일 추가

interface ReactMarkdownWrapperProps {
  children?: string;
}

export default function ReactMarkdownWrapper({
  children,
}: ReactMarkdownWrapperProps) {
  return (
    <div className="p-[12px]">
      <div className="h-[44px] w-full tool-bar-skelton sticky top-0" />

      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
