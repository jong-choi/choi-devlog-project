import { createClient } from "@/utils/supabase/server";
import {
  PostgrestError,
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
    BY_RECOMMENDED: () => "subcategories:by_recommended",
    BY_URL_SLUG: (urlSlug: string = "") => "subcategory:by_url_slug:" + urlSlug,
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
      tags: [cacheTag, ...tags],
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
export type WithCacheParams<P, T, Single extends boolean = false> = {
  key?: string[];
  tags?: string[];
  revalidate?: number;
  single?: Single;
  requireAuth?: boolean;
  skipCache?: (ctx: {
    supabase: SupabaseClient;
    params: P;
    presets: ReturnType<typeof makePresets>;
  }) => Promise<boolean>;
  handler: (
    supabase: SupabaseClient,
    params: P
  ) => Promise<WithSupabaseReturn<T, Single>>;
};

// 응답 타입 분기 유틸
type WithSupabaseReturn<T, Single extends boolean> = Single extends true
  ? PostgrestSingleResponse<T>
  : PostgrestResponse<T>;

const makeAuthError = <T, Single extends boolean>(): WithSupabaseReturn<
  T,
  Single
> => {
  const error = new Error("Authentication required") as PostgrestError;
  error.code = "401";

  return {
    data: null,
    error,
    count: null,
    status: 401,
    statusText: "Unauthorized",
  } as WithSupabaseReturn<T, Single>;
};

export const makePresets = () => {
  return {
    async isLoggedIn({ supabase }: { supabase: SupabaseClient }) {
      const { data } = await supabase.auth.getSession();
      return !!data.session?.user;
    },
    async isPrivatePost({
      supabase,
      params,
    }: {
      supabase: SupabaseClient;
      params: { postId?: string };
    }) {
      const { postId } = params;
      if (typeof postId !== "string") return true;
      const { data } = await supabase
        .from("posts")
        .select("is_private")
        .eq("id", postId)
        .single();
      return data?.is_private === true;
    },
    async isPrivatePostByUrlSLug({
      supabase,
      params,
    }: {
      supabase: SupabaseClient;
      params: { urlSlug?: string };
    }) {
      const { urlSlug } = params;
      if (typeof urlSlug !== "string") return true;
      const { data } = await supabase
        .from("posts")
        .select("is_private")
        .eq("url_slug", urlSlug)
        .single();
      return data?.is_private === true;
    },
  };
};

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
 * @param options.requireAuth - true인 경우 인증된 사용자만 요청 가능 (기본: false)
 * @param options.revalidate - 캐시 재검증 주기 (초 단위, 기본값: 미인증시 30일 / 인증필요시 fresh)
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
  const {
    handler,
    key,
    tags,
    requireAuth = false,
    skipCache,
    revalidate: rawRevalidate,
  } = options;

  if (requireAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return makeAuthError<T, Single>();
    }
  }

  const shouldSkipCache =
    (await skipCache?.({ supabase, params, presets: makePresets() })) ||
    rawRevalidate === 0;

  if (shouldSkipCache) {
    return handler(supabase, params);
  }

  const revalidate = rawRevalidate ?? 60 * 60 * 24 * 30;

  const cached = unstable_cache(() => handler(supabase, params), key ?? [], {
    revalidate,
    tags,
  });

  return cached();
};

// 캐시 함수 예시

// 1. 다건 조회 / 30일 캐싱
// await withSupabaseCache({}, {
//   key: ["posts", "all"],
//   tags: ["posts"],
//   handler: async (supabase) => {
//     return supabase.from("posts").select("*");
//   },
// });

// 2. 단건 조회 / 5분 캐싱
// await withSupabaseCache({ id: 123 }, {
//   key: ["post", "by-id", "123"],
//   tags: ["post:123"],
//   revalidate: 60 * 5,
//   single: true,
//   handler: async (supabase, { id }) => {
//     return supabase.from("posts").select("*").eq("id", id).single();
//   },
// });

// 3. 인증 필요 / 로그인 여부에 따라 캐시 스킵
// await withSupabaseCache({ user_id: "abc" }, {
//   requireAuth: true,
//   single: false,
//   skipCache: async ({ supabase, presets }) => await presets.isLoggedIn(supabase),
//   handler: async (supabase, { user_id }) => {
//     return supabase.from("followers").select("*").eq("user_id", user_id);
//   },
// });

// 4. 인증 필요 / 5분 캐싱
// await withSupabaseCache({ user_id: "abc" }, {
//   requireAuth: true,
//   single: false,
//   revalidate: 60 * 5,
//   handler: async (supabase, { user_id }) => {
//     return supabase.from("followers").select("*").eq("user_id", user_id);
//   },
// });

// 5. 다건 조회 / 검색어가 있는 경우 노 캐싱
// await withSupabaseCache({ keyword: "hello" }, {
//   key: ["posts", "search"],
//   tags: ["posts"],
//   skipCache: async ({ params }) => !!params.keyword,
//   handler: async (supabase, { keyword }) => {
//     return supabase.from("posts").select("*").ilike("title", `%${keyword}%`);
//   },
// });

// 6. 비공개 게시글은 캐싱하지 않음
// await withSupabaseCache({ postId: "abc123" }, {
//   key: ["post", "abc123"],
//   tags: ["post:abc123"],
//   revalidate: 60 * 5,
//   single: true,
//   skipCache: async ({ params, presets }) => await presets.isPrivatePost({}),
//   handler: async (supabase, { postId }) => {
//     return supabase.from("posts").select("*").eq("id", postId).single();
//   },
// });
