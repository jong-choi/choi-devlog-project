"use server";
import {
  CACHE_TAGS,
  ENDPOINT,
  fetchWithCache,
  QueryParams,
} from "@/utils/nextCache";
import { Database } from "@/types/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

interface GetPostByURLParams extends QueryParams {
  urlSlug: string;
}

export const getPostByUrlSlug = async (
  params: GetPostByURLParams,
  cookieStore?: ReadonlyRequestCookies
) =>
  fetchWithCache<
    PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
  >({
    endpoint: ENDPOINT.posts.byUrlSlug,
    params,
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_URL_SLUG(params.urlSlug)],
    revalidate: 60 * 60 * 24 * 7,
    cookieStore,
  });
