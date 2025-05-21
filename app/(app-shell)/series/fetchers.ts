"use server";
import { Series } from "@/types/series";
import { Database } from "@/types/supabase";
import {
  CACHE_TAGS,
  ENDPOINT,
  fetchWithCache,
  QueryParams,
} from "@/utils/nextCache";
import { PostgrestResponse } from "@supabase/supabase-js";

interface GetSeriesListParams extends QueryParams {
  categoryId?: string;
  recommended?: boolean;
}

export const getSeriesList = async (params?: GetSeriesListParams) => {
  const tags: string[] = [
    "subcategories_with_published_meta",
    CACHE_TAGS.SUBCATEGORY.ALL(),
    CACHE_TAGS.SUBCATEGORY.HOME(),
  ];

  if (params?.categoryId) {
    tags.push(CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(params.categoryId));
  }

  if (params?.recommended) {
    tags.push(CACHE_TAGS.SUBCATEGORY.BY_RECOMMENDED());
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
    tags: [CACHE_TAGS.CATEGORY.ALL()],
    revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
  });
