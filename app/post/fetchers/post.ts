"use server";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import { SupabaseClient } from "@supabase/supabase-js";

interface GetPostByURLParams {
  urlSlug: string;
}
const _getPostByUrlSlug = async (
  supabase: SupabaseClient<Database>,
  { urlSlug }: GetPostByURLParams
) => {
  const isLoggedIn = Boolean((await supabase.auth.getSession()).data.session);
  const result = await supabase
    .from("posts")
    .select()
    .eq("url_slug", urlSlug) // URL 슬러그 일치
    .is("deleted_at", null) // 삭제되지 않은 게시글만 조회
    .or(
      isLoggedIn
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    )
    .single();

  return result;
};

export const getPostByUrlSlug = async (params: GetPostByURLParams) =>
  withSupabaseCache<
    GetPostByURLParams,
    Database["public"]["Tables"]["posts"]["Row"],
    true
  >(params, {
    handler: _getPostByUrlSlug,
    key: [
      "getPostByUrlSlug",
      CACHE_TAGS.POST.ALL(),
      CACHE_TAGS.POST.BY_URL_SLUG(params.urlSlug),
    ],
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_URL_SLUG(params.urlSlug)],
    skipCache: async ({ supabase, params, presets }) =>
      await presets.isPrivatePostByUrlSLug({ supabase, params }),
    revalidate: 60 * 60 * 24 * 7, // 1주일 캐싱
  });
