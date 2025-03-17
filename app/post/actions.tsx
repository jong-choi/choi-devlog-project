import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export const createPost = async (
  payload: Database["public"]["Tables"]["posts"]["Insert"]
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Insert"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .insert(payload)
    .select()
    .limit(1)
    .single();

  return result;
};

export const getPostByUrlSlug = async (
  url_slug: string,
  is_private?: boolean | undefined
): Promise<
  PostgrestSingleResponse<Database["public"]["Tables"]["posts"]["Row"]>
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("posts")
    .select()
    .eq("url_slug", url_slug) // url_slug 일치
    .is("deleted_at", null) // deleted_at이 null
    .not("released_at", "is", null) // released_at이 null이 아님
    .is("is_private", !!is_private)
    .order("created_at", { ascending: false }) // 최신순 정렬
    .limit(1)
    .single(); // 단일 객체 반환

  return result;
};

export const createAISummary = async (
  payload: Omit<
    Database["public"]["Tables"]["ai_summaries"]["Insert"],
    "vector"
  > & { vector: number[] | null }
): Promise<
  PostgrestSingleResponse<
    Omit<Database["public"]["Tables"]["ai_summaries"]["Insert"], "vector"> & {
      vector: number[] | null;
    }
  >
> => {
  const supabase = await createClient();
  const result = await supabase
    .from("ai_summaries")
    .insert(payload)
    .select()
    .limit(1)
    .single();

  return result;
};
