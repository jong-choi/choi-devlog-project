"use server";
import { Category, Post } from "@/types/post";
import { Database } from "@/types/supabase";
import { CACHE_TAGS, withSupabaseCache } from "@/utils/nextCache";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";

const _getSidebarPublishedPosts = async (
  supabase: SupabaseClient<Database>
) => {
  const result = (await supabase
    .from("published_posts")
    .select(
      "id, url_slug, title, short_description, is_private, order, subcategory_id"
    )
    .order("order", { ascending: true })) as PostgrestResponse<Post>;
  return result;
};

export const getSidebarPublishedPosts = async () =>
  withSupabaseCache<null, Post>(null, {
    handler: _getSidebarPublishedPosts,
    key: ["getSidebarPublishedPosts", CACHE_TAGS.POST.ALL()],
    tags: [CACHE_TAGS.POST.ALL()],
    revalidate: 60 * 60 * 24 * 7, // 1주일
  });

const _getSidebarCategory = async (
  supabase: SupabaseClient<Database>
): Promise<PostgrestResponse<Category>> => {
  const result = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        order,
        subcategories(id, name, order)
      `
    )
    .order("order", { ascending: true })
    .order("order", { ascending: true, referencedTable: "subcategories" });

  return result;
};

export const getSidebarCategory = async () =>
  withSupabaseCache<null, Category>(null, {
    handler: _getSidebarCategory,
    key: [
      "getSidebarCategory",
      CACHE_TAGS.CATEGORY.ALL(),
      CACHE_TAGS.SUBCATEGORY.ALL(),
    ],
    tags: [CACHE_TAGS.CATEGORY.ALL(), CACHE_TAGS.SUBCATEGORY.ALL()],
    revalidate: 60 * 60 * 24 * 30, // 30일
  });
