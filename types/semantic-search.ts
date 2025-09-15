import { Database } from "@/types/supabase";

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

export type HybridSearchDbRow = Database["public"]["Functions"]["search_posts_hybrid"]["Returns"][0];

export type RerankerInputRow = {
  chunk_id: string;
  post_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export type CombinedRow = HybridSearchDbRow & RerankerInputRow;
export type RerankedCombinedRow = CombinedRow & { rerankScore: number | null };