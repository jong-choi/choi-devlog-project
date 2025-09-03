"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createAISummary, createTagsByPostId } from "@/app/post/actions";
import { Button } from "@/components/ui/button";

type PostData = {
  id: string;
  title: string;
  url_slug: string;
  created_at: string;
  body?: string;
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
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: { summary: boolean; similarity: boolean };
  }>({});
  const [generatingAllSimilarity, setGeneratingAllSimilarity] = useState(false);
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

  const setPostLoading = (
    postId: string,
    type: "summary" | "similarity",
    isLoading: boolean,
  ) => {
    setLoadingStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [type]: isLoading,
      },
    }));
  };

  const createSummary = async (title: string, body: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      console.error(data.error);
      return null;
    }

    const data = await response.json();
    return data;
  };

  const handleCreateSummary = async (post: PostData) => {
    setPostLoading(post.id, "summary", true);

    try {
      // 게시글 내용을 가져오기 위한 API 호출
      const postResponse = await fetch(
        `/api/posts/slug?urlSlug=${encodeURIComponent(post.url_slug)}`,
      );
      if (!postResponse.ok) {
        toast.error("게시글 내용을 가져올 수 없습니다.");
        return;
      }

      const response = await postResponse.json();
      if (response.error || !response.data) {
        toast.error("게시글 내용을 가져올 수 없습니다.");
        return;
      }

      const postData = response.data;
      const data = await createSummary(postData.title, postData.body);

      if (!data || !data.summary) {
        toast.error("인공지능 요약 생성에 실패하였습니다.");
        return;
      }

      const { summary, vector } = data;
      const payload = {
        post_id: post.id,
        summary,
        vector,
      };

      const { data: AIData } = await createAISummary(payload);
      if (!AIData || !AIData.id) {
        toast.error("요약을 DB에 등록하지 못하였습니다.");
        return;
      }

      const TagsData = await createTagsByPostId({
        post_id: AIData.post_id || "",
        id: AIData.id,
        summary: AIData.summary,
      });

      if (!TagsData || !TagsData.post_id) {
        toast.error("태그를 생성하지 못하였습니다.");
        return;
      }

      toast.success("요약 생성에 성공하였습니다.");
      await fetchPosts(); // 데이터 새로고침
    } catch (error) {
      console.error(error);
      toast.error("요약 생성 중 오류가 발생했습니다.");
    } finally {
      setPostLoading(post.id, "summary", false);
    }
  };

  const handleCreateAllSimilarity = async () => {
    setGeneratingAllSimilarity(true);

    try {
      const response = await fetch("/api/similarity/generate", {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("추천 게시글 생성에 실패했습니다.");
        return;
      }

      const data = await response.json();
      toast.success(`추천 게시글 생성 완료 (${data.count}개 유사도 계산)`);
      await fetchPosts(); // 데이터 새로고침
    } catch (error) {
      console.error(error);
      toast.error("추천 게시글 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingAllSimilarity(false);
    }
  };

  const handleCreateSimilarity = async (postId: string) => {
    setPostLoading(postId, "similarity", true);

    try {
      const response = await fetch("/api/summary/recommended", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "추천 게시글 생성에 실패했습니다.");
        return;
      }

      await response.json();
      toast.success("추천 게시글 생성에 성공했습니다.");
      await fetchPosts(); // 데이터 새로고침
    } catch (error) {
      console.error("추천 게시글 생성 오류:", error);
      toast.error("추천 게시글 생성 중 오류가 발생했습니다.");
    } finally {
      setPostLoading(postId, "similarity", false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">관리자 페이지</h1>
      </div>

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
        <div className="p-4 border-b flex justify-between">
          <h2 className="text-xl font-semibold">
            게시글 목록 (총 {filteredAndSortedPosts.length}개)
          </h2>
          <Button
            onClick={handleCreateAllSimilarity}
            variant="default"
            disabled={generatingAllSimilarity}
            className="px-6 py-2"
          >
            {generatingAllSimilarity ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                유사도 생성 중...
              </>
            ) : (
              "모든 게시글 유사도 생성"
            )}
          </Button>
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
                      <div className="flex items-center gap-2">
                        <span>{post.ai_summaries[0]?.count || 0}</span>
                        <Button
                          onClick={() => handleCreateSummary(post)}
                          variant="outline"
                          size="sm"
                          disabled={loadingStates[post.id]?.summary}
                          className="h-6 text-xs"
                        >
                          {loadingStates[post.id]?.summary ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "요약"
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{post.post_similarities[0]?.count || 0}</span>
                        <Button
                          onClick={() => handleCreateSimilarity(post.id)}
                          variant="outline"
                          size="sm"
                          disabled={loadingStates[post.id]?.similarity}
                          className="h-6 text-xs"
                        >
                          {loadingStates[post.id]?.similarity ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "추천"
                          )}
                        </Button>
                      </div>
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
