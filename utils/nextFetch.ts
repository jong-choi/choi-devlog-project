export const ENDPOINT = {
  map: {
    clusterData: "/api/map/clusters",
    clusterSimData: "/api/map/similarities",
    clusterWithPostsById: "/api/map/clusters/posts",
  },
  posts: {
    search: "/api/posts/search",
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
};

export type QueryParams = Record<string, string | number | boolean | undefined>;

type FetchFromApiOptions = {
  endpoint: string;
  params?: QueryParams;
  revalidate?: number;
  tags?: string[];
  skipCache?: boolean;
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

  const res = await fetch(fullUrl, {
    next: skipCache ? undefined : { revalidate, tags },
  });

  return res.json();
};
