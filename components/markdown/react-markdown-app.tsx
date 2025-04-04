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
        img: ({ src = "", alt = "" }) => (
          <Image
            src={src}
            alt={alt}
            // https://stackoverflow.com/questions/69230343/nextjs-image-component-with-fixed-witdth-and-auto-height
            width="0" // width와 height에 0을 줘서 렌더링 계산에서 제외
            height="0"
            sizes="(max-width: 768px) 100vw, 50vw" // 이미지 크기 힌팅 : sm사이즈에서 100vw, 그 이상에서 50vw에 맞는 이미지로 불러오기 (supabase가 이미지 프록시 서버가 아니라서 작동 안하긴 함)
            className="w-auto h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] xl:h-[340px]" // css를 통해 실제 렌더링 크기를 확정
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
