"use server";
import { ClusterWithPosts } from "@/types/graph";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, ENDPOINT, fetchWithCache } from "@/utils/nextCache";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";

export const getClusterData = async () =>
  fetchWithCache<
    PostgrestResponse<Database["public"]["Tables"]["clusters"]["Row"]>
  >({
    endpoint: ENDPOINT.map.clusterData,
    tags: [CACHE_TAGS.CLUSTER.ALL()],
    revalidate: 60 * 60 * 24 * 30,
  });

export const getClusterSimData = async (params?: { threshold?: number }) =>
  fetchWithCache<
    PostgrestResponse<
      Database["public"]["Tables"]["cluster_similarities"]["Row"]
    >
  >({
    params,
    endpoint: ENDPOINT.map.clusterSimData,
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

export const getClusterWithPostsById = async (id: string) =>
  fetchWithCache<PostgrestSingleResponse<ClusterWithPosts>>({
    params: { id },
    endpoint: ENDPOINT.map.clusterWithPostsById, // 쿼리스트링 기반
    tags: ["clusters_with_published_posts", CACHE_TAGS.CLUSTER.BY_ID(id)],
    revalidate: 60 * 60 * 24 * 30,
  });
