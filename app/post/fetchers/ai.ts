"use server";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";

const _getAISummaryByPostId = async (
  supabase: SupabaseClient<Database>,
  {
    post_id,
  }: {
    post_id: string;
  }
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["ai_summaries"]["Row"]>
> => {
  const result = await supabase
    .from("ai_summaries")
    .select()
    .eq("post_id", post_id)
    .order("created_at", { ascending: false })
    .single();

  return result;
};

export const getAISummaryByPostId = async (post_id: string) =>
  withSupabaseCache<
    { post_id: string },
    Database["public"]["Tables"]["ai_summaries"]["Row"],
    true
  >(
    { post_id },
    {
      handler: _getAISummaryByPostId,
      key: ["getAISummaryByPostId", CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post_id)],
      tags: [CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post_id)],
      revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
    }
  );

const _getRecommendedListByPostId = async (
  supabase: SupabaseClient<Database>,
  {
    post_id,
  }: {
    post_id: string;
  }
): Promise<
  PostgrestResponse<
    Database["public"]["Views"]["post_similarities_with_target_info"]["Row"]
  >
> => {
  const result = await supabase
    .from("post_similarities_with_target_info")
    .select()
    .eq("source_post_id", post_id) // 특정 게시글에 대한 요약만 조회
    .order("similarity", { ascending: false }); // 최신 요약이 가장 위로 오도록 정렬

  return result;
};

export const getRecommendedListByPostId = async (post_id: string) =>
  withSupabaseCache<
    { post_id: string },
    Database["public"]["Views"]["post_similarities_with_target_info"]["Row"]
  >(
    { post_id },
    {
      handler: _getRecommendedListByPostId,
      key: [
        "getRecommendedListByPostId",
        CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post_id),
      ],
      tags: [CACHE_TAGS.AI_SUMMARY.BY_POST_ID(post_id)],
      revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
    }
  );
