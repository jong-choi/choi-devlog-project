"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { AdminPostData } from "@/app/api/(fetchers)/admin/route";
import { useAdminTableStore } from "@/providers/admin-table-store-provider";
import AdminPostTableRow from "./admin-post-table-row";

type AdminPostsTableProps = {
  allPosts: AdminPostData[];
};

export default function AdminPostsTable({ allPosts }: AdminPostsTableProps) {
  const filters = useAdminTableStore(useShallow((state) => state.filters));

  const posts = useMemo(() => {
    let result = [...allPosts];

    // 필터링
    if (filters.hasSummary) {
      result = result.filter((post) => {
        const hasSummary = !!post.ai_summaries;
        return filters.hasSummary === "true" ? hasSummary : !hasSummary;
      });
    }

    // 정렬
    result.sort((a, b) => {
      let compareValue = 0;

      if (filters.sortBy === "created_at") {
        const aDate = new Date(a.created_at || "").getTime();
        const bDate = new Date(b.created_at || "").getTime();
        compareValue = aDate - bDate;
      } else if (filters.sortBy === "recommendation_count") {
        const aCount = a.post_similarities[0]?.count || 0;
        const bCount = b.post_similarities[0]?.count || 0;
        compareValue = aCount - bCount;
      } else if (filters.sortBy === "summaryExistence") {
        const aSummary = !!a.ai_summaries ? 1 : 0;
        const bSummary = !!b.ai_summaries ? 1 : 0;
        compareValue = aSummary - bSummary;
      }

      return filters.sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [allPosts, filters]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-xl font-semibold">
          게시글 목록 (총 {posts.length}개)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL 슬러그
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AI 요약
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                추천
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <AdminPostTableRow key={post.id} post={post} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
