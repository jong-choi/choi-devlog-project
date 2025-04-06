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
        img: ({ src, alt = "" }) => {
          if (!src)
            return (
              <Image
                src={
                  "data:image/svg+xml;base64," +
                  "Cjxzdmcgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxNTAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjlmOWY5Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMzZweCI+4pqg77iP8J+YrTwvdGV4dD4KPC9zdmc+Cg=="
                }
                alt="image-error"
                width="0"
                height="0"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-auto h-[180px] shadow-glass"
              />
            );
          return (
            <Image
              src={src}
              alt={alt}
              // https://stackoverflow.com/questions/69230343/nextjs-image-component-with-fixed-witdth-and-auto-height
              width="0"
              height="0"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-auto h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] xl:h-[340px]"
            />
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
