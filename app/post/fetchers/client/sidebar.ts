import { Category, Post } from "@/types/post";
import { Database } from "@/types/supabase";
import { PostgrestResponse, SupabaseClient } from "@supabase/supabase-js";

export const getClientSidebarCategory = async (
  supabase: SupabaseClient<Database>
): Promise<PostgrestResponse<Category>> => {
  const result = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        order,
        subcategories(id, name, order, category_id, url_slug)
      `
    )
    .is("deleted_at", null)
    .is("subcategories.deleted_at", null)
    .order("order", { ascending: true })
    .order("order", { ascending: true, referencedTable: "subcategories" });

  return result;
};

export const getClientSidebarPublishedPosts = async (
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

export const getClientSidebarPrivatePosts = async (
  supabase: SupabaseClient<Database>,
  uid: string
) => {
  const result = await supabase
    .from("posts")
    .select(
      "id, url_slug, title, short_description, is_private, order, subcategory_id"
    )
    .eq("is_private", true)
    .eq("user_id", uid)
    .is("deleted_at", null)
    .order("order", { ascending: true });
  return result;
};
