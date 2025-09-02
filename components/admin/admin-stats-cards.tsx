"use client";

import { AdminPostsResponse } from "@/types/admin";

interface AdminStatsCardsProps {
  summary: AdminPostsResponse["summary"];
  isLoading?: boolean;
}

export default function AdminStatsCards({
  summary,
  isLoading,
}: AdminStatsCardsProps) {
  const cards = [
    {
      title: "전체 게시글",
      value: summary.totalPosts,
      color: "bg-blue-500",
    },
    {
      title: "AI 요약 완료",
      value: summary.withAISummary,
      color: "bg-green-500",
    },
    {
      title: "추천 연결 완료",
      value: summary.withRecommendations,
      color: "bg-purple-500",
    },
    {
      title: "평균 추천 개수",
      value: summary.averageRecommendations,
      color: "bg-orange-500",
      isDecimal: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className={`${card.color} w-4 h-4 rounded mr-3`} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="animate-pulse">-</span>
                ) : card.isDecimal ? (
                  card.value.toFixed(1)
                ) : (
                  card.value
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}