"use server";
import { ClusterWithPosts } from "@/types/graph";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";

const _getClusterData = async (
  supabase: SupabaseClient<Database>
): Promise<
  PostgrestResponse<Database["public"]["Tables"]["clusters"]["Row"]>
> => {
  const result = await supabase
    .from("clusters")
    .select("*")
    .order("quality", { ascending: true });

  if (result.error) {
    console.error("❌ Supabase fetch error:", result.error.message);
  }

  return result;
};

export const getClusterData = async () =>
  withSupabaseCache<null, Database["public"]["Tables"]["clusters"]["Row"]>(
    null,
    {
      handler: _getClusterData,
      key: ["getClusterData", CACHE_TAGS.CLUSTER.ALL()],
      tags: [CACHE_TAGS.CLUSTER.ALL()],
      revalidate: 60 * 60 * 24 * 30,
    }
  );

const _getClusterSimData = async (
  supabase: SupabaseClient<Database>
): Promise<
  PostgrestResponse<Database["public"]["Tables"]["cluster_similarities"]["Row"]>
> => {
  const THRESHOLD = 0.6; // 원하는 기준값 설정

  const result = await supabase
    .from("cluster_similarities")
    .select("*")
    .gte("similarity", THRESHOLD) // ✅ THRESHOLD 이상만 필터링
    .order("similarity", { ascending: false });

  if (result.error) {
    console.error("❌ Supabase fetch error:", result.error.message);
  }

  return result;
};

export const getClusterSimData = async () =>
  withSupabaseCache<
    null,
    Database["public"]["Tables"]["cluster_similarities"]["Row"]
  >(null, {
    handler: _getClusterSimData,
    key: ["getClusterSimData", CACHE_TAGS.CLUSTER.ALL()],
    tags: [CACHE_TAGS.CLUSTER.ALL()],
    revalidate: 60 * 60 * 24 * 30,
  });

const _getClusterWithPostsById = async (
  supabase: SupabaseClient<Database>,
  clusterId: string
): Promise<PostgrestSingleResponse<ClusterWithPosts>> => {
  const result = await supabase
    .from("clusters_with_published_posts")
    .select("*")
    .eq("id", clusterId)
    .single(); // 단일 클러스터 반환

  return result;
};

export const getClusterWithPostsById = async (clusterId: string) =>
  withSupabaseCache<string, ClusterWithPosts, true>(clusterId, {
    handler: _getClusterWithPostsById,
    key: ["clusters_with_published_posts", clusterId],
    tags: [
      "clusters_with_published_posts",
      CACHE_TAGS.CLUSTER.BY_ID(clusterId),
    ],
    revalidate: 60 * 60 * 24 * 30,
  });
