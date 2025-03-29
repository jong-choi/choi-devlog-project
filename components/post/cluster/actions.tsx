import { ClusterWithPosts, GraphPost, PostTags } from "@/types/graph";
import { CardPost } from "@/types/post";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, createCachedFunction } from "@/utils/nextCache";
import { createClient as createClientClient } from "@/utils/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

const _getClusterData = async (): Promise<
  PostgrestResponse<
    Database["public"]["Tables"]["clustered_posts_groups"]["Row"]
  >
> => {
  const supabase = createClientClient();
  const result = await supabase
    .from("clustered_posts_groups")
    .select("*")
    .order("quality", { ascending: true });

  if (result.error) {
    console.error("❌ Supabase fetch error:", result.error.message);
  }

  return result;
};

export const getClusterData = unstable_cache(
  _getClusterData,
  [CACHE_TAGS.CLUSTER.ALL()],
  {
    revalidate: 60 * 60 * 24 * 30,
  }
);

const _getClusterSimData = async (): Promise<
  PostgrestResponse<
    Database["public"]["Tables"]["clustered_posts_groups_similarities"]["Row"]
  >
> => {
  const THRESHOLD = 0.6; // 원하는 기준값 설정

  const supabase = createClientClient();
  const result = await supabase
    .from("clustered_posts_groups_similarities")
    .select("*")
    .gte("similarity", THRESHOLD) // ✅ THRESHOLD 이상만 필터링
    .order("similarity", { ascending: false });

  if (result.error) {
    console.error("❌ Supabase fetch error:", result.error.message);
  }

  return result;
};

export const getClusterSimData = unstable_cache(
  _getClusterSimData,
  [CACHE_TAGS.CLUSTER.ALL()],
  {
    revalidate: 60 * 60 * 24 * 30,
  }
);

async function _getClusterFeed(...arg: boolean[]): Promise<ClusterWithPosts[]> {
  const supabase = createClientClient();
  // 1. 클러스터 가져오기
  const { data: clusters, error: clusterError } = await supabase
    .from("clustered_posts_groups")
    .select("id, title, post_ids, quality, summary");

  if (clusterError || !clusters)
    throw new Error("클러스터 데이터를 불러올 수 없습니다.");

  // 2. post_ids 모두 모으기
  const allPostIds = clusters.flatMap((c) => c.post_ids || []);

  const isValid = typeof arg.at(-1) === "boolean" && arg.at(-1);
  // 3. 게시글 가져오기
  const { data: posts, error: postError } = await supabase
    .from("posts")
    .select("id, title, short_description, thumbnail, released_at")
    .or(
      isValid
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    )
    .in("id", allPostIds);

  if (postError || !posts)
    throw new Error("게시글 데이터를 불러올 수 없습니다.");

  // 4. 태그 붙이기
  const { data: taggedPosts, error: tagError } = await supabase
    .from("post_tags")
    .select("post_id, tags(id, name)")
    .in("post_id", allPostIds);

  if (tagError || !taggedPosts)
    throw new Error("태그 데이터를 불러올 수 없습니다.");

  // 5. short_description 없는 post만 추려서 AI summary 가져오기
  const missingDescIds = posts
    .filter((p) => !p.short_description)
    .map((p) => p.id);

  const { data: aiSummaries, error: summaryError } = await supabase
    .from("ai_summaries")
    .select("post_id, summary")
    .in("post_id", missingDescIds);

  if (summaryError || !aiSummaries)
    throw new Error("AI 요약 데이터를 불러올 수 없습니다.");

  // 6. post_id → tags[] 맵
  const postTagsMap = new Map<string, PostTags[]>();
  for (const item of taggedPosts) {
    if (!item.tags) continue;
    if (!postTagsMap.has(item.post_id)) {
      postTagsMap.set(item.post_id, []);
    }
    postTagsMap.get(item.post_id)!.push(item.tags);
  }

  // 7. post_id → summary 맵
  const summaryMap = new Map<string, string>();
  for (const item of aiSummaries) {
    if (item.post_id && item.summary) {
      summaryMap.set(item.post_id, item.summary);
    }
  }

  // 8. posts에 tags + summary 붙이기
  const postMap = new Map<string, GraphPost & { tags: PostTags[] }>();
  for (const post of posts) {
    postMap.set(post.id, {
      ...post,
      short_description:
        post.short_description ?? summaryMap.get(post.id) ?? null,
      tags: postTagsMap.get(post.id) ?? [],
    });
  }

  // 9. 클러스터에 posts 붙이기
  const result: ClusterWithPosts[] = clusters.map((cluster) => {
    const clusterPostIds = cluster.post_ids || [];
    const clusterPosts = clusterPostIds
      .map((id) => postMap.get(id))
      .filter((p): p is GraphPost & { tags: PostTags[] } => !!p);

    return {
      ...cluster,
      posts: clusterPosts,
    };
  });

  return result;
}

export const getClusterFeed = createCachedFunction(
  CACHE_TAGS.CLUSTER.ALL(),
  _getClusterFeed
);

async function _getRecentFeed(...arg: boolean[]): Promise<CardPost[]> {
  const supabase = createClientClient();

  const isValid = typeof arg.at(-1) === "boolean" && arg.at(-1);
  // 3. 게시글 가져오기
  const { data: posts, error: postError } = await supabase
    .from("posts")
    .select("id, title, short_description, thumbnail, released_at")
    .or(
      isValid
        ? "is_private.is.null,is_private.is.false,is_private.is.true"
        : "is_private.is.null,is_private.is.false"
    )
    .order("released_at", { ascending: false })
    .limit(5);

  if (postError || !posts)
    throw new Error("게시글 데이터를 불러올 수 없습니다.");

  const postIds = posts.map((post) => post.id);
  // 4. 태그 붙이기
  const { data: taggedPosts, error: tagError } = await supabase
    .from("post_tags")
    .select("post_id, tags(id, name)")
    .in("post_id", postIds);

  if (tagError || !taggedPosts)
    throw new Error("태그 데이터를 불러올 수 없습니다.");

  // 5. short_description 없는 post만 추려서 AI summary 가져오기
  const missingDescIds = posts
    .filter((p) => !p.short_description)
    .map((p) => p.id);

  const { data: aiSummaries, error: summaryError } = await supabase
    .from("ai_summaries")
    .select("post_id, summary")
    .in("post_id", missingDescIds);

  if (summaryError || !aiSummaries)
    throw new Error("AI 요약 데이터를 불러올 수 없습니다.");

  // 6. post_id → tags[] 맵
  const postTagsMap = new Map<string, PostTags[]>();
  for (const item of taggedPosts) {
    if (!item.tags) continue;
    if (!postTagsMap.has(item.post_id)) {
      postTagsMap.set(item.post_id, []);
    }
    postTagsMap.get(item.post_id)!.push(item.tags);
  }

  // 7. post_id → summary 맵
  const summaryMap = new Map<string, string>();
  for (const item of aiSummaries) {
    if (item.post_id && item.summary) {
      summaryMap.set(item.post_id, item.summary);
    }
  }

  // 8. posts에 tags + summary 붙이기
  const postMap = new Map<string, GraphPost & { tags: PostTags[] }>();

  for (const post of posts) {
    postMap.set(post.id, {
      ...post,
      short_description:
        post.short_description ?? summaryMap.get(post.id) ?? null,
      tags: postTagsMap.get(post.id) ?? [],
    });
  }

  const result: CardPost[] = posts.map((post) => {
    return {
      ...post,
      short_description:
        post.short_description ?? summaryMap.get(post.id) ?? null,
      tags: postTagsMap.get(post.id) ?? [],
    };
  });

  return result;
}

export const getRecentFeed = createCachedFunction(
  CACHE_TAGS.POST.ALL(),
  _getRecentFeed
);
