export interface AdminPostData {
  id: string;
  title: string;
  url_slug: string;
  released_at: string;
  is_private: boolean;
  created_at: string;
  ai_summary?: {
    id: string;
    summary: string;
    created_at: string;
  } | null;
  recommended_count: number;
}

export interface AdminPostsResponse {
  posts: AdminPostData[];
  total: number;
  summary: {
    totalPosts: number;
    withAISummary: number;
    withRecommendations: number;
    averageRecommendations: number;
  };
}

export interface BatchResponse {
  success: string[];
  failed: Array<{
    postId: string;
    error: string;
  }>;
}

export type FilterType = "public_only" | "private_only" | "with_summary" | "without_summary" | "less_than_10_recommendations";

export type SortByType = "title" | "released_at" | "created_at";

export type SortOrderType = "asc" | "desc";

export interface AdminPostsParams {
  page?: number;
  pageSize?: number;
  filter?: FilterType[];
  search?: string;
  sortBy?: SortByType;
  sortOrder?: SortOrderType;
}

export type PostStatus = "idle" | "summary_loading" | "recommendations_loading" | "summary_error" | "recommendations_error";