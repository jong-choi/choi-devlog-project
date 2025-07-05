"use client";
import { useAuthStore } from "@/providers/auth-provider";
import { Post } from "@/types/post";
import { LinkLoader } from "@ui/route-loader";
import { Button } from "@ui/button";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getRecommendedListByPostId,
  revalidateAIAummaryByPostId,
} from "@/app/post/fetchers";
import { simsToPosts } from "@/utils/uploadingUtils";
import { useSummary } from "@/providers/summary-store-provider";

export default function AiRecommendedList({
  posts,
  isSummary,
  postId,
}: {
  posts: Post[];
  isSummary: boolean;
  postId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const { isValid } = useAuthStore(
    useShallow((state) => ({
      isValid: state.isValid,
    }))
  );

  const { setRecommendedPosts } = useSummary(
    useShallow((state) => ({
      setRecommendedPosts: state.setRecommendedPosts,
    }))
  );

  const onClick = async () => {
    if (!isValid) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }

    if (!isSummary) {
      toast.error("요약을 먼저 진행하여 주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/summary/recommended`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId }),
        }
      );
      toast.success("추천 게시글 분석이 완료되었습니다.");
      await revalidateAIAummaryByPostId(postId);
      const { data: postsData } = await getRecommendedListByPostId(postId);
      setRecommendedPosts(simsToPosts(postsData || []));
    } catch (error) {
      console.error(error);
      toast.error("추천 게시글 분석에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hidden md:flex flex-col border-x border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-x-hidden w-full">
      <div className="px-4 w-full overflow-auto space-y-1 scrollbar flex flex-col">
        <div className="flex flex-col px-3 pb-2">
          <div className="font-extralight select-none">추천 게시글</div>
          <div className="select-none text-sm">
            ✨ 유사도 분석으로 찾은 추천 게시글입니다.
          </div>
        </div>
        <Button
          onClick={onClick}
          variant="outline"
          size="sm"
          className={cn(isSummary && isValid ? "h-fit py-0.5 mb-2" : "hidden")}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              분석 중...
            </>
          ) : (
            "추천 게시글 분석"
          )}
        </Button>
        <hr />
        {!posts.length && isSummary && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            추천 게시글이 없습니다.
          </div>
        )}
        {posts.map((post) => (
          <LinkLoader
            key={post.id}
            href={`/post/${post.url_slug}`}
            className="block px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-100  transition"
          >
            {post.title}
          </LinkLoader>
        ))}
      </div>
    </div>
  );
}
