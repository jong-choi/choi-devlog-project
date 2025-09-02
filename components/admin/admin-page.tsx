"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  AdminPostData,
  AdminPostsParams,
  AdminPostsResponse,
  PostStatus,
  BatchResponse,
} from "@/types/admin";
import AdminStatsCards from "./admin-stats-cards";
import AdminFilters from "./admin-filters";
import AdminPostsTable from "./admin-posts-table";
import AdminPagination from "./admin-pagination";
import AdminSummaryDialog from "./admin-summary-dialog";
import { Spinner } from "@/components/ui/spinner";

export default function AdminPage() {
  const [data, setData] = useState<AdminPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postStatuses, setPostStatuses] = useState<Record<string, PostStatus>>({});
  const [selectedPost, setSelectedPost] = useState<AdminPostData | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  
  const [params, setParams] = useState<AdminPostsParams>({
    page: 0,
    pageSize: 20,
    filter: [],
    search: "",
    sortBy: "released_at",
    sortOrder: "desc",
  });

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.set("page", params.page.toString());
      if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
      if (params.filter && params.filter.length > 0) {
        params.filter.forEach(f => searchParams.append("filter", f));
      }
      if (params.search) searchParams.set("search", params.search);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const response = await fetch(`/api/admin/posts?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const result: AdminPostsResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("게시글 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updatePostStatus = (postId: string, status: PostStatus) => {
    setPostStatuses((prev) => ({ ...prev, [postId]: status }));
  };

  const handleCreateSummary = async (postId: string) => {
    updatePostStatus(postId, "summary_loading");
    try {
      const response = await fetch("/api/admin/ai/batch-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: [postId] }),
      });

      if (!response.ok) {
        throw new Error("Failed to create summary");
      }

      const result: BatchResponse = await response.json();
      
      if (result.success.includes(postId)) {
        toast.success("AI 요약이 생성되었습니다.");
        fetchPosts();
      } else {
        const error = result.failed.find(f => f.postId === postId);
        throw new Error(error?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error creating summary:", error);
      toast.error("AI 요약 생성에 실패했습니다.");
      updatePostStatus(postId, "summary_error");
    } finally {
      setTimeout(() => {
        updatePostStatus(postId, "idle");
      }, 1000);
    }
  };

  const handleCreateRecommendations = async (postId: string) => {
    updatePostStatus(postId, "recommendations_loading");
    try {
      const response = await fetch("/api/admin/ai/batch-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: [postId] }),
      });

      if (!response.ok) {
        throw new Error("Failed to create recommendations");
      }

      const result: BatchResponse = await response.json();
      
      if (result.success.includes(postId)) {
        toast.success("추천 게시글이 생성되었습니다.");
        fetchPosts();
      } else {
        const error = result.failed.find(f => f.postId === postId);
        throw new Error(error?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error creating recommendations:", error);
      toast.error("추천 게시글 생성에 실패했습니다.");
      updatePostStatus(postId, "recommendations_error");
    } finally {
      setTimeout(() => {
        updatePostStatus(postId, "idle");
      }, 1000);
    }
  };

  const handleViewSummary = (post: AdminPostData) => {
    setSelectedPost(post);
    setIsSummaryDialogOpen(true);
  };

  const handleParamsChange = (newParams: Partial<AdminPostsParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI 콘텐츠 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          게시글의 AI 요약과 추천 게시글을 관리할 수 있습니다.
        </p>
      </div>

      {data && (
        <AdminStatsCards summary={data.summary} isLoading={isLoading} />
      )}

      <AdminFilters params={params} onParamsChange={handleParamsChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            로딩 중...
          </span>
        </div>
      ) : data ? (
        <>
          <AdminPostsTable
            posts={data.posts}
            postStatuses={postStatuses}
            onCreateSummary={handleCreateSummary}
            onCreateRecommendations={handleCreateRecommendations}
            onViewSummary={handleViewSummary}
          />

          <AdminPagination
            currentPage={params.page || 0}
            totalItems={data.total}
            pageSize={params.pageSize || 20}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          데이터를 불러올 수 없습니다.
        </div>
      )}

      <AdminSummaryDialog
        post={selectedPost}
        isOpen={isSummaryDialogOpen}
        onClose={() => {
          setIsSummaryDialogOpen(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
}