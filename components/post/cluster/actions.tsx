import { Database } from "@/types/supabase";
import { CACHE_TAGS } from "@/utils/nextCache";
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
