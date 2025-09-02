"use client";

import { AdminPostData } from "@/types/admin";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPostStatusProps {
  post: AdminPostData;
}

export default function AdminPostStatus({ post }: AdminPostStatusProps) {
  const hasSummary = !!post.ai_summary;
  const hasRecommendations = post.recommended_count > 0;

  const getRecommendationColor = (count: number) => {
    if (count === 0) return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    if (count <= 3) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
    if (count <= 7) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    return "text-green-600 bg-green-100 dark:bg-green-900/30";
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {hasSummary ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm">
          {hasSummary ? "AI요약" : "요약없음"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getRecommendationColor(post.recommended_count)
          )}
        >
          {post.recommended_count}개
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">추천</span>
      </div>

      {post.is_private && (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            비공개
          </span>
        </div>
      )}
    </div>
  );
}