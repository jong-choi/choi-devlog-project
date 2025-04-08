"use server";

import { CardPost } from "@/types/post";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";

interface GetPublishedPostsParams {
  page: number;
  limit?: number;
  keyword?: string;
}

export const _getPublishedPosts = async (
  supabase: SupabaseClient<Database>,
  { page, limit = 10, keyword = "" }: GetPublishedPostsParams
): Promise<PostgrestResponse<CardPost>> => {
  const result = await supabase.rpc("search_posts_with_snippet", {
    search_text: keyword,
    page,
    page_size: limit,
  });

  return result;
};

export const getPublishedPosts = async (params: GetPublishedPostsParams) =>
  withSupabaseCache<GetPublishedPostsParams, CardPost>(params, {
    handler: _getPublishedPosts,
    key: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    skipCache: async ({ params }) => !!params.keyword,
    revalidate: 60 * 60 * 24 * 7,
  });
