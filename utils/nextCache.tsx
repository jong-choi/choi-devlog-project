import { unstable_cache, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  CATEGORY: { ALL: () => "categories" },
  SUBCATEGORY: {
    ALL: () => "subcategories",
    BY_CATEGORY_ID: (categoryId?: string) =>
      "subcategories:by_category:" + categoryId,
  },
  AI_SUMMARY: {
    BY_POST_ID: (postId?: string) => "ai_summary:by_post:" + postId,
  },
  POST: {
    BY_URL_SLUG: (urlSlug?: string) => "post:by_url_slug:" + urlSlug,
    BY_SUBCATEGORY_ID: (subcategoryId?: string) =>
      "posts:by_subcategory_id:" + subcategoryId,
  },
} as const;

// 캐싱 태그를 동적으로 생성하는 함수
const getCacheTag = (key: string, id?: string) => (id ? `${key}:${id}` : key);

// 캐싱 래핑 팩토리
export const createCachedFunction = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => Promise<any>
>(
  key: string,
  fn: T
) => {
  return ((...args: Parameters<T>) => {
    const id = args[0]; // ID (예: category_id, post_id 등)
    const cacheTag = getCacheTag(key, typeof id === "string" ? id : undefined);

    return unstable_cache(fn, [cacheTag], { revalidate: 60 * 5 })(...args);
  }) as T;
};

// 특정 ID의 캐시 태그 무효화
export const invalidateCache = (key: string, id?: string) => {
  const cacheTag = id ? `${key}:${id}` : key;
  revalidateTag(cacheTag);
};

export const createWithInvalidation = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => Promise<any>
>(
  key: string,
  fn: T
) => {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args); // 원래 함수 실행

    if (result?.data) {
      // ✅ 해당 키에 대한 캐시 무효화
      const id = args[0]; // 첫 번째 인자를 ID로 가정
      invalidateCache(key, typeof id === "string" ? id : undefined);
    }

    return result;
  }) as T;
};
