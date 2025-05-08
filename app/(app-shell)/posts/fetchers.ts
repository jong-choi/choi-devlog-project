"use server";

import { CardPost } from "@/types/post";
import {
  CACHE_TAGS,
  ENDPOINT,
  fetchWithCache,
  QueryParams,
} from "@/utils/nextCache";
import { PostgrestResponse } from "@supabase/supabase-js";

interface GetPublishedPostsParams extends QueryParams {
  page: number;
  limit?: number;
  keyword?: string;
}

export const getPublishedPosts = async (params: GetPublishedPostsParams) =>
  fetchWithCache<PostgrestResponse<CardPost>>({
    endpoint: ENDPOINT.posts.search,
    params,
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_PAGE(params.page)],
    skipCache: !!params.keyword,
    revalidate: 60 * 60 * 24 * 7,
  });
