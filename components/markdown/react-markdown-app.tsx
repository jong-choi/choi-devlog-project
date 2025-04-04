import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "@/components/markdown/styles/highlight-vs-code-dark.css";
import Image from "next/image";

export default function ReactMarkdownApp({ children }: { children?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkParse, remarkBreaks]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        img: (props) => (
          <Image
            {...props}
            src={props.src || ""}
            width={props.width ? Number(props.width) : 500}
            height={props.height ? Number(props.height) : 400}
            alt={props.alt ?? ""}
            className="rounded-md"
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
