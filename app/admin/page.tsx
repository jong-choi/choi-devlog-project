"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/admin-header";
import AdminFilters from "@/components/admin/admin-filters";
import AdminPostsTable from "@/components/admin/admin-posts-table";

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

  const revalidateCacheTags = async (cacheTags: string[]) => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: cacheTags,
        }),
      });
    } catch (error) {
      console.error("캐시 재검증 중 오류:", error);
      toast.error("캐시 재검증 중 오류가 발생했습니다.");
    }
  };

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
      <AdminHeader />
      <AdminFilters filters={filters} onFilterChange={handleFilterChange} />
      <AdminPostsTable
        posts={filteredAndSortedPosts}
        loading={loading}
        revalidateCacheTags={revalidateCacheTags}
        onDataRefresh={fetchPosts}
      />
    </div>
  );
}
