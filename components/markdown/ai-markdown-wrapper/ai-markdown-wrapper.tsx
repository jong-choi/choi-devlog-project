import { cn } from "@/lib/utils";
import "@/components/markdown/styles/small-header-markdown.css";
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
    <div className={cn("p-[12px] new-york-small", className || "")}>
      <ReactMarkdownApp>{children}</ReactMarkdownApp>
    </div>
  );
}
