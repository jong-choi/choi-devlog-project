"use server";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, ENDPOINT, fetchWithCache } from "@/utils/nextCache";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

export const getAISummaryByPostId = async (postId: string) => {
  return fetchWithCache<
    PostgrestSingleResponse<Database["public"]["Tables"]["ai_summaries"]["Row"]>
  >({
    endpoint: ENDPOINT.ai.summaryByPostId,
    params: { post_id: postId },
    tags: [CACHE_TAGS.AI_SUMMARY.BY_POST_ID(postId)],
    revalidate: 60 * 60 * 24 * 30,
  });
};

export const getRecommendedListByPostId = async (postId: string) => {
  return fetchWithCache<
    PostgrestResponse<
      Database["public"]["Views"]["post_similarities_with_target_info"]["Row"]
    >
  >({
    endpoint: ENDPOINT.ai.recommendedByPostId,
    params: { post_id: postId },
    tags: [CACHE_TAGS.AI_SUMMARY.BY_POST_ID(postId)],
    revalidate: 60 * 60 * 24 * 30,
  });
};

export const revalidateAIAummaryByPostId = async (postId: string) => {
  revalidateTag(CACHE_TAGS.AI_SUMMARY.BY_POST_ID(postId));
};
