"use server";
import { Series } from "@/types/series";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";

interface GetSeriesListParams {
  categoryId?: string;
  recommended?: boolean;
}

export const _getSeriesList = async (
  supabase: SupabaseClient<Database>,
  { categoryId, recommended = false }: GetSeriesListParams
): Promise<PostgrestResponse<Series>> => {
  const query = supabase
    .from("subcategories_with_published_meta")
    .select("*")
    .not("latest_post_date", "is", null)
    .order("latest_post_date", { ascending: false }); // 전체 조회시 최신이 가장 위로

  if (categoryId) {
    query.eq("category_id", categoryId).order("order", { ascending: true });
  }

  if (recommended) {
    query.is("recommended", recommended).order("order", { ascending: true });
  }

  const result = await query;

  return result;
};

/**
 * 시리즈를 불러옵니다. (시리즈는 메타 정보가 포함된 subcategoies 테이블을 의미합니다.)
 *
 * option 객체를 통해 필터링을 지원하며, 불러온 게시글은 30일 간 캐싱됩니다.
 *
 * @param {GetSeriesListParams} [params] - 시리즈 조회 시 사용할 선택적 필터링 옵션입니다.
 * @param {string} [params.categoryId] - 특정 카테고리에 속한 서브카테고리만 조회할 경우 사용합니다.
 * @param {boolean} [params.recommended=false] - 추천 시리즈만 조회할 경우 true로 설정합니다.
 *
 * @returns {Promise<PostgrestResponse<Series>>} 캐싱된 시리즈 배열
 *
 * @example
 * // 모든 시리즈 (최근 업데이트 순)
 * const {data, error} = await getSeriesList();
 *
 * // Get series under a specific category
 * const {data, error} = await getSeriesList({ categoryId: "cat-123" });
 *
 * // Get recommended series
 * const {data, error} = await getSeriesList({ recommended: true });
 *
 * @see subcategories_with_published_meta - 게시글 수와 최근 게시일 등의 메타 정보를 포함하는 Supabase 뷰
 */
export const getSeriesList = async (params?: GetSeriesListParams) => {
  const tags = [
    "subcategories_with_published_meta",
    CACHE_TAGS.SUBCATEGORY.ALL(),
  ];
  if (params?.categoryId) {
    tags.push(CACHE_TAGS.SUBCATEGORY.BY_CATEGORY_ID(params.categoryId));
  }
  if (params?.recommended) {
    tags.push(CACHE_TAGS.SUBCATEGORY.BY_RECOMMENDED());
  }

  return withSupabaseCache<GetSeriesListParams, Series>(params || {}, {
    handler: _getSeriesList,
    key: [...tags],
    tags: [...tags],
    revalidate: 60 * 60 * 24 * 30, // 30일 캐싱
  });
};

const _getCategories = async (
  supabase: SupabaseClient<Database>
): Promise<
  PostgrestResponse<Database["public"]["Tables"]["categories"]["Row"]>
> => {
  const result = await supabase
    .from("categories")
    .select()
    .is("deleted_at", null)
    .order("order", { ascending: true }); // 생성순 정렬

  return result;
};

export const getCategories = async () =>
  withSupabaseCache<null, Database["public"]["Tables"]["categories"]["Row"]>(
    null,
    {
      handler: _getCategories,
      key: ["getCategories", CACHE_TAGS.CATEGORY.ALL()],
      tags: [CACHE_TAGS.CATEGORY.ALL()],
      revalidate: 60 * 60 * 24 * 30, // 30일
    }
  );
