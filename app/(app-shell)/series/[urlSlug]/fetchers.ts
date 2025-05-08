"use server";
import { Series } from "@/types/series";
import { CACHE_TAGS } from "@/utils/nextCache";
import { CardPost } from "@/types/post";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { ENDPOINT, fetchWithCache } from "@/utils/nextFetch";

export const getPostsBySeriesId = async (seriesId: string) => {
  return fetchWithCache<PostgrestResponse<CardPost>>({
    endpoint: ENDPOINT.series.postsBySeriesId,
    params: { seriesId },
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_SUBCATEGORY_ID(seriesId)],
    revalidate: 60 * 60 * 24 * 30,
  });
};

export const getSeriesByUrlSlug = async (urlSlug: string) => {
  return fetchWithCache<PostgrestSingleResponse<Series>>({
    endpoint: ENDPOINT.series.seriesByUrlSlug,
    params: { urlSlug },
    tags: [
      CACHE_TAGS.SUBCATEGORY.ALL(),
      CACHE_TAGS.SUBCATEGORY.BY_URL_SLUG(urlSlug),
      CACHE_TAGS.POST.ALL(),
    ],
    revalidate: 60 * 60 * 24 * 30,
  });
};
