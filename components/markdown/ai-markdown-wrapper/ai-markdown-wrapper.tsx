import ReactMarkdownApp from "@/components/markdown/react-markdown-app";
import "@/components/markdown/styles/small-header-markdown.css";
import { cn } from "@/lib/utils";

interface ReactMarkdownWrapperProps {
  className?: string;
  children?: string;
}

export default function AiMarkdownWrapper({
  children,
  className,
}: ReactMarkdownWrapperProps) {
  return (
    <div className={cn("p-[12px] new-york-small break-all", className || "")}>
      <ReactMarkdownApp>{children}</ReactMarkdownApp>
    </div>
  );
}
