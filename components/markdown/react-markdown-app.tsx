import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css"; // rehype-highlight 스타일 추가
import Image from "next/image"; // 반드시 import 해야 함

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
