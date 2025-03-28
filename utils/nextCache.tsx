import { createClient } from "@/utils/supabase/server";
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
