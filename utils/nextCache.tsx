import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

export const CACHE_TAGS = {
  CATEGORY: { ALL: () => "categories" },
  SUBCATEGORY: {
    ALL: () => "subcategories",
    BY_CATEGORY_ID: (categoryId: string = "") =>
      "subcategories:by_category:" + categoryId,
  },
  AI_SUMMARY: {
    BY_POST_ID: (postId: string = "") => "ai_summary:by_post:" + postId,
  },
  POST: {
    ALL: () => "posts",
    BY_PAGE: (page: number) => "posts:by_page:" + page.toLocaleString(),
    BY_URL_SLUG: (urlSlug: string = "") => "post:by_url_slug:" + urlSlug,
    BY_SUBCATEGORY_ID: (subcategoryId: string = "") =>
      "posts:by_subcategory_id:" + subcategoryId,
  },
  SIDEBAR: {
    CATEGORY: () => "sidebar:category",
    SELECTED_BY_URL_SLUG: (urlSlug: string = "") =>
      "sidebar:selected:" + urlSlug,
  },
  CLUSTER: {
    ALL: () => "cluster",
  },
} as const;

// 캐싱 태그를 동적으로 생성하는 함수
const getCacheTag = (key: string, id?: string) => (id ? `${key}${id}` : key);

// 캐싱 래핑 팩토리
export const createCachedFunction = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => Promise<any>
>(
  key: string,
  fn: T,
  tags: string[] = []
) => {
  return (async (...args: Parameters<T>) => {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const userCreatedAt = (await supabase.auth.getUser()).data.user?.created_at;
    const isValid = process.env.VALID_USER_CREATED_AT === userCreatedAt;
    if (isValid) return fn(...args, isValid);
    const id = args[0]; // ID (예: category_id, post_id 등)
    const cacheTag = getCacheTag(key, typeof id === "string" ? id : undefined);
    return unstable_cache(fn, [cacheTag, ...tags], {
      revalidate: 60 * 60 * 24 * 30,
    })(...args, isValid);
  }) as T;
};

export const createWithInvalidation = <T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  invalidateFn: (result: T) => void
): ((...args: A) => Promise<T>) => {
  return async (...args: A) => {
    const result = await fn(...args);
    invalidateFn(result);
    return result;
  };
};

// 새로운 캐시함수 래퍼
interface WithCacheParams<P, T, Single extends boolean = false> {
  key: string[];
  tags: string[];
  revalidate?: number;
  skipCache?: (params: P) => boolean;
  single?: Single;
  handler: (
    supabase: SupabaseClient<Database>,
    params: P
  ) => Promise<WithSupabaseReturn<T, Single>>;
}

// 응답 타입 분기 유틸
type WithSupabaseReturn<T, Single extends boolean> = Single extends true
  ? PostgrestSingleResponse<T>
  : PostgrestResponse<T>;

/**
 * Supabase Client를 기반으로 캐싱된 서버 요청을 실행합니다.
 *
 * - 캐시 키 및 태그를 통해 `unstable_cache`를 구성합니다.
 * - `single` 옵션을 통해 단건(single) 또는 다건(list) 응답을 선택할 수 있습니다.
 * - `skipCache` 조건이 true일 경우 캐시를 우회하고 항상 fresh 요청을 실행합니다.
 *
 * @template P - 파라미터 타입
 * @template T - 반환될 데이터의 row 타입
 * @template Single - 단건 여부 (`true`이면 PostgrestSingleResponse, 아니면 PostgrestResponse)
 *
 * @param params - Supabase 요청에 전달할 파라미터
 * @param options - 캐싱과 핸들러 설정
 * @param options.handler - Supabase 요청을 수행할 비동기 핸들러
 * @param options.key - unstable_cache에 사용할 고유한 캐시 키
 * @param options.tags - 캐시 무효화에 사용할 태그 목록
 * @param options.revalidate - 캐시 재검증 주기 (초 단위, 기본값: 60초)
 * @param options.skipCache - 조건부 캐시 우회 함수 (true일 경우 handler를 직접 호출)
 * @param options.single - 단건 조회 여부 (true 시 PostgrestSingleResponse<T> 반환)
 *
 * @returns Supabase 응답 객체 (단건 또는 다건 응답)
 */
export const withSupabaseCache = async <P, T, Single extends boolean = false>(
  params: P,
  options: WithCacheParams<P, T, Single>
): Promise<WithSupabaseReturn<T, Single>> => {
  const supabase = await createClient(await cookies());

  if (options.skipCache?.(params)) {
    return options.handler(supabase, params);
  }

  const cached = unstable_cache(
    () => options.handler(supabase, params),
    options.key,
    {
      revalidate: options.revalidate ?? 60,
      tags: options.tags,
    }
  );

  return cached();
};
