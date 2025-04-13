"use server";

import {
  getClientSidebarCategory,
  getClientSidebarPublishedPosts,
} from "@/app/post/fetchers/client/sidebar";
import { Category, Post } from "@/types/post";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";

export const getSidebarPublishedPosts = async () =>
  withSupabaseCache<null, Post>(null, {
    handler: getClientSidebarPublishedPosts,
    key: ["getSidebarPublishedPosts", CACHE_TAGS.POST.ALL()],
    tags: [CACHE_TAGS.POST.ALL()],
    revalidate: 60 * 60 * 24 * 7, // 1주일
  });

export const getSidebarCategory = async () =>
  withSupabaseCache<null, Category>(null, {
    handler: getClientSidebarCategory,
    key: [
      "getSidebarCategory",
      CACHE_TAGS.CATEGORY.ALL(),
      CACHE_TAGS.SUBCATEGORY.ALL(),
    ],
    tags: [CACHE_TAGS.CATEGORY.ALL(), CACHE_TAGS.SUBCATEGORY.ALL()],
    revalidate: 60 * 60 * 24 * 30, // 30일
  });
