"use server";

import { Category, Post } from "@/types/post";
import { CACHE_TAGS, ENDPOINT, fetchWithCache } from "@/utils/nextCache";
import { PostgrestResponse } from "@supabase/supabase-js";

export const getSidebarCategory = async () =>
  fetchWithCache<PostgrestResponse<Category>>({
    endpoint: ENDPOINT.sidebar.category,
    tags: [CACHE_TAGS.CATEGORY.ALL(), CACHE_TAGS.SUBCATEGORY.ALL()],
    revalidate: 60 * 60 * 24 * 30,
  });

export const getSidebarPublishedPosts = async () =>
  fetchWithCache<PostgrestResponse<Post>>({
    endpoint: ENDPOINT.sidebar.posts,
    tags: [CACHE_TAGS.POST.ALL()],
    revalidate: 60 * 60 * 24 * 7,
  });
