import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // rehype-highlight 스타일 추가
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth-store";

interface ReactMarkdownWrapperProps {
  children?: string;
}

export default function ReactMarkdownWrapper({
  children,
}: ReactMarkdownWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMessage, setIsMessage] = useState(false);
  const isValid = useAuthStore((state) => state.isValid);

  useEffect(() => {
    if (!isMounted && !isMessage) {
      setIsMounted(true);
      setIsMessage(true);
      setTimeout(() => setIsMessage(false), 15000);
    }
  }, [isMounted, isMessage]);

  return (
    <div className="p-[12px]">
      <div
        className={cn(
          "h-[44px] w-full sticky top-0 flex flex-col justify-start items-end transition-opacity duration-1000",
          isMessage ? "opacity-50" : "opacity-0"
        )}
      >
        <div>
          게시글을 클릭하여 수정
          {isValid ? (
            ""
          ) : (
            <span className="text-rose-600 text-xs">(게스트 모드)</span>
          )}
        </div>
      </div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
