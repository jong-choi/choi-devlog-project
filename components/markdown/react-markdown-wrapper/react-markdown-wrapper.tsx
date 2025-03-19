import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // rehype-highlight 스타일 추가
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface ReactMarkdownWrapperProps {
  children?: string;
}

export default function ReactMarkdownWrapper({
  children,
}: ReactMarkdownWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMessage, setIsMessage] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // ✅ 현재 로그인된 세션 가져오기
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    }
    getSession();

    // ✅ 로그인 상태 변경 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!isMounted && !isMessage) {
      setIsMounted(true);
      setIsMessage(true);
      setTimeout(() => setIsMessage(false), 5000);
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
          {!user ? (
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
