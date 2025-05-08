"use server";
import { Database } from "@/types/supabase";
import { CACHE_TAGS } from "@/utils/nextCache";
import { ENDPOINT, fetchWithCache } from "@/utils/nextFetch";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

export const getAISummaryByPostId = async (post_id: string) => {
  return fetchWithCache<
    PostgrestSingleResponse<Database["public"]["Tables"]["ai_summaries"]["Row"]>
  >({
    endpoint: ENDPOINT.ai.summaryByPostId,
    params: { post_id },
    tags: [CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post_id)],
    revalidate: 60 * 60 * 24 * 30,
  });
};

export const getRecommendedListByPostId = async (post_id: string) => {
  return fetchWithCache<
    PostgrestResponse<
      Database["public"]["Views"]["post_similarities_with_target_info"]["Row"]
    >
  >({
    endpoint: ENDPOINT.ai.recommendedByPostId,
    params: { post_id },
    tags: [CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post_id)],
    revalidate: 60 * 60 * 24 * 30,
  });
};
