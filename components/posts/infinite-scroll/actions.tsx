"use server";

import { CardPost } from "@/types/post";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";

interface GetPostsParams {
  page: number;
  limit?: number;
  keyword?: string;
}

export const _getPosts = async (
  supabase: SupabaseClient<Database>,
  { page, limit = 10, keyword = "" }: GetPostsParams
): Promise<PostgrestResponse<CardPost>> => {
  const result = await supabase.rpc("search_posts_with_snippet", {
    search_text: keyword,
    page,
    page_size: limit,
  });

  return result;
};

export const getPosts = async (params: GetPostsParams) =>
  withSupabaseCache<GetPostsParams, CardPost>(params, {
    handler: _getPosts,
    key: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    skipCache: async ({ params }) => !!params.keyword, // 검색어 있으면 캐싱하지 않음
    revalidate: 60 * 60 * 24 * 7, // 1주일 캐싱
  });
