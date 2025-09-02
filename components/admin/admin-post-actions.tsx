"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AdminPostData, PostStatus } from "@/types/admin";
import { Sparkles, Link2, Eye } from "lucide-react";

interface AdminPostActionsProps {
  post: AdminPostData;
  status: PostStatus;
  onCreateSummary: (postId: string) => void;
  onCreateRecommendations: (postId: string) => void;
  onViewSummary?: (post: AdminPostData) => void;
  onViewRecommendations?: (post: AdminPostData) => void;
}

export default function AdminPostActions({
  post,
  status,
  onCreateSummary,
  onCreateRecommendations,
  onViewSummary,
  onViewRecommendations,
}: AdminPostActionsProps) {
  const hasSummary = !!post.ai_summary;
  const hasRecommendations = post.recommended_count > 0;
  const isSummaryLoading = status === "summary_loading";
  const isRecommendationsLoading = status === "recommendations_loading";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCreateSummary(post.id)}
          disabled={isSummaryLoading || isRecommendationsLoading}
          className="h-8 text-xs"
        >
          {isSummaryLoading ? (
            <Spinner size="sm" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {hasSummary ? "재생성" : "생성하기"}
        </Button>

        {hasSummary && onViewSummary && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewSummary(post)}
            className="h-8 w-8 p-0"
            title="요약 보기"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCreateRecommendations(post.id)}
          disabled={
            !hasSummary || isSummaryLoading || isRecommendationsLoading
          }
          className="h-8 text-xs"
          title={!hasSummary ? "AI 요약을 먼저 생성하세요" : ""}
        >
          {isRecommendationsLoading ? (
            <Spinner size="sm" />
          ) : (
            <Link2 className="h-3 w-3" />
          )}
          {hasRecommendations ? "재생성" : "생성하기"}
        </Button>

        {hasRecommendations && onViewRecommendations && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewRecommendations(post)}
            className="h-8 w-8 p-0"
            title="추천 목록 보기"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}