"use server";
import { Series } from "@/types/series";
import { Database } from "@/types/supabase";
import { CACHE_TAGS } from "@/utils/nextCache";
import { ENDPOINT, fetchWithCache, QueryParams } from "@/utils/nextFetch";
import { PostgrestResponse } from "@supabase/supabase-js";

interface GetSeriesListParams extends QueryParams {
  categoryId?: string;
  recommended?: boolean;
}

export const getSeriesList = async (params?: GetSeriesListParams) => {
  const tags = [
    "subcategories_with_published_meta",
    CACHE_TAGS.SUBCATEGORY.ALL(),
  ];

  if (params?.categoryId) {
    tags.push(`subcategory:category:${params.categoryId}`);
  }

  if (params?.recommended) {
    tags.push("subcategory:recommended");
  }

  return fetchWithCache<PostgrestResponse<Series>>({
    endpoint: ENDPOINT.series.list,
    params,
    tags,
    revalidate: 60 * 60 * 24 * 30,
  });
};

export const getCategories = async () =>
  fetchWithCache<
    PostgrestResponse<Database["public"]["Tables"]["categories"]["Row"]>
  >({
    endpoint: ENDPOINT.categories.list,
    tags: ["categories", "categories:all"],
    revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
  });
