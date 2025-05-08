"use server";
import { ENDPOINT, fetchWithCache, QueryParams } from "@/utils/nextFetch";
import { CACHE_TAGS } from "@/utils/nextCache";
import { Database } from "@/types/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

interface GetPostByURLParams extends QueryParams {
  urlSlug: string;
}

export const getPostByUrlSlug = async (params: GetPostByURLParams) => {
  /* skipCache 로직 넣으면 게시글을 두 번씩 호출해야 하니까 제외함. 비공개 게시글을 스킵하는 로직은 페이지 내부에 작동하고 있기 때문에 overhead가 큼
  const presets = makePresets();
  const supabase = await createClient();
  const skipCache = await presets.isPrivatePostByUrlSLug({ supabase, params });
   */
  return fetchWithCache<
    PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
  >({
    endpoint: ENDPOINT.posts.byUrlSlug,
    params,
    tags: [CACHE_TAGS.POST.ALL(), CACHE_TAGS.POST.BY_URL_SLUG(params.urlSlug)],
    revalidate: 60 * 60 * 24 * 7,
    // skipCache,
  });
};
