import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const CACHE_TAGS = {
  CATEGORY: { ALL: () => "categories" },
  SUBCATEGORY: {
    ALL: () => "subcategories",
    HOME: () => "subcategories:home",
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
    BY_ID: (clusterId: string) => "cluster:by_id:" + clusterId,
  },
} as const;

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

export const ENDPOINT = {
  map: {
    clusterData: "/api/map/clusters",
    clusterSimData: "/api/map/similarities",
    clusterWithPostsById: "/api/map/clusters/posts",
  },
  posts: {
    search: "/api/posts/search",
    byUrlSlug: "/api/posts/slug",
  },
  series: {
    list: "/api/series/list",
    postsBySeriesId: "/api/series/posts",
    seriesByUrlSlug: "/api/series",
  },
  categories: {
    list: "/api/categories",
  },
  ai: {
    summaryByPostId: "/api/ai/summary",
    recommendedByPostId: "/api/ai/recommended",
  },
  sidebar: {
    category: "/api/sidebar/categories",
    posts: "/api/sidebar/posts",
  },
};

export type QueryParams = Record<string, string | number | boolean | undefined>;

type FetchFromApiOptions = {
  endpoint: string;
  params?: QueryParams;
  revalidate?: number;
  tags?: string[];
  skipCache?: boolean;
  cookieStore?: ReadonlyRequestCookies;
};

export const fetchWithCache = async <T>(
  options: FetchFromApiOptions
): Promise<T> => {
  const {
    endpoint,
    params,
    revalidate = 3600,
    tags = [],
    skipCache = false,
    cookieStore,
  } = options;

  const query = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&");

  const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}${
    query ? `?${query}` : ""
  }`;

  const headers: HeadersInit = {};

  if (cookieStore) {
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    headers["Cookie"] = cookieHeader;
  }

  try {
    const res = await fetch(fullUrl, {
      headers,
      next: skipCache ? undefined : { revalidate, tags },
    });

    const result = await res.json();
    return result;
  } catch (_e) {
    const error = new Error("Fetch Failed") as PostgrestError;

    return {
      data: null,
      error,
      count: null,
      status: 400,
      statusText: "Fetch Failed",
    } as T;
  }
};
