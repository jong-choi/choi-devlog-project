"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PostData = {
  id: string;
  title: string;
  url_slug: string;
  created_at: string;
  ai_summaries: { count?: number }[];
  post_similarities: { count?: number }[];
};

type ApiResponse = {
  data: PostData[];
  total: number;
};

export default function AdminPage() {
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    hasSummary: "",
    combine: "or",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin`);
      const data: ApiResponse = await response.json();

      setAllPosts(data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...allPosts];

    // 필터링
    if (filters.hasSummary) {
      result = result.filter((post) => {
        const hasSummary = (post.ai_summaries[0]?.count || 0) > 0;
        return filters.hasSummary === "true" ? hasSummary : !hasSummary;
      });
    }

    // 정렬
    result.sort((a, b) => {
      let compareValue = 0;

      if (filters.sortBy === "created_at") {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        compareValue = aDate - bDate;
      } else if (filters.sortBy === "recommendation_count") {
        const aCount = a.post_similarities[0]?.count || 0;
        const bCount = b.post_similarities[0]?.count || 0;
        compareValue = aCount - bCount;
      }

      return filters.sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [allPosts, filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">필터</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">AI 요약</label>
            <select
              value={filters.hasSummary}
              onChange={(e) => handleFilterChange("hasSummary", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">전체</option>
              <option value="true">있음</option>
              <option value="false">없음</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">정렬 기준</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="created_at">생성일</option>
              <option value="recommendation_count">추천 수</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">정렬 순서</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            게시글 목록 (총 {filteredAndSortedPosts.length}개)
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">로딩 중...</div>
        ) : (
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
                {filteredAndSortedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/post/${post.url_slug}`}
                        className="font-medium text-gray-900"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.url_slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.ai_summaries[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.post_similarities[0]?.count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
