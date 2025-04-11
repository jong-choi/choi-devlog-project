"use server";
import { Series } from "@/types/series";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import { CardPost } from "@/types/post";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";

export const _getPostsBySeriesId = async (
  supabase: SupabaseClient<Database>,
  { seriesId }: { seriesId: string }
): Promise<PostgrestResponse<CardPost>> => {
  const result = await supabase
    .from("published_posts_with_tags_summaries")
    .select("*")
    .eq("subcategory_id", seriesId)
    .order("order", { ascending: true }); // order 낮은 것부터

  return result;
};

export const getPostsBySeriesId = async (seriesId: string) =>
  withSupabaseCache<{ seriesId: string }, CardPost>(
    { seriesId },
    {
      handler: _getPostsBySeriesId,
      key: [
        "published_posts_with_tags_summaries",
        CACHE_TAGS.POST.ALL(),
        CACHE_TAGS.POST.BY_SUBCATEGORY_ID(seriesId),
      ],
      tags: [
        CACHE_TAGS.POST.ALL(),
        CACHE_TAGS.POST.BY_SUBCATEGORY_ID(seriesId),
      ],
      revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
    }
  );

const _getSeriesByUrlSlug = async (
  supabase: SupabaseClient<Database>,
  { urlSlug }: { urlSlug: string }
): Promise<PostgrestSingleResponse<Series>> => {
  const result = await supabase
    .from("subcategories_with_published_meta")
    .select()
    .eq("url_slug", urlSlug)
    .single();
  console.log(result);
  return result;
};

export const getSeriesByUrlSlug = async (urlSlug: string) =>
  withSupabaseCache<{ urlSlug: string }, Series, true>(
    { urlSlug },
    {
      handler: _getSeriesByUrlSlug,
      key: [
        CACHE_TAGS.SUBCATEGORY.ALL(),
        CACHE_TAGS.SUBCATEGORY.BY_URL_SLUG(urlSlug),
      ],
      tags: [
        CACHE_TAGS.POST.ALL(),
        CACHE_TAGS.SUBCATEGORY.BY_URL_SLUG(urlSlug),
      ],
      revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
    }
  );
