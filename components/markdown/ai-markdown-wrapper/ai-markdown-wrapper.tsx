import { cn } from "@/lib/utils";
import "@/components/markdown/github-markdown.css";
import "@/components/markdown/ai-markdown-wrapper/small-header-markdown.css";
import ReactMarkdownApp from "@/components/markdown/react-markdown-app";

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
      className={cn("p-[12px] markdown-body new-york-small", className || "")}
    >
      <ReactMarkdownApp>{children}</ReactMarkdownApp>
    </div>
  );
}
