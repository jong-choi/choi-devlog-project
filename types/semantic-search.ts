import { Database, Json } from "@/types/supabase";

export type HybridSearchRequest = {
  query: string;
  overSampleCount?: number;
  minThreshold?: number;
  maxResults?: number;
  minResults?: number;
  ftsWeight?: number;
  vectorWeight?: number;
  rrfK?: number;
};

export type HybridSearchDbRow =
  Database["public"]["Functions"]["search_posts_hybrid"]["Returns"][0];

export type RerankerInputRow = {
  chunk_id: string;
  post_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export type CombinedRow = HybridSearchDbRow & RerankerInputRow;
export type Reranked<T> = T & { rerankScore: number | null };
export type RerankedCombinedRow = Reranked<CombinedRow>;

export type SemanticSearchResult = {
  post_id: string;
  title: string;
  short_description: string | null;
  url_slug: string;
  thumbnail: string | null;
  released_at: string | null;
  chunk_content: string | null;
  chunk_index: number | null;
  rerank_score: number | undefined;
  fts_rank: number;
  cosine_similarity: number;
  tags: Json | null;
};

export type SearchTestResult = Omit<
  SemanticSearchResult,
  "released_at" | "tags"
>;

export type SearchTestParams = Required<HybridSearchRequest>;

export type QueryTestResult = Reranked<RerankerInputRow>;

export interface QueryTestParams {
  query: string;
  k: number;
  minSimilarity: number;
}
